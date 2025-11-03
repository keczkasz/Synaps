# Synaps GPT Integration Guide

This guide explains how to configure the Synaps Connection Assistant as a ChatGPT Custom GPT.

## Overview

The Synaps GPT integration allows users to discover and connect with others who share their interests directly from their ChatGPT conversations. The GPT acts as a proactive connection facilitator, learning from conversations and suggesting relevant matches.

## Architecture

```
ChatGPT GPT
    ↓ (OAuth 2.0)
OAuth Authorization Flow
    ↓
GPT API Endpoints (Supabase Edge Functions)
    ↓
Synaps Database & Profile Matching
```

## Setup Instructions

### Step 1: Get OAuth Credentials

1. The default OAuth client is already configured in the database
2. Get the client credentials:
   ```sql
   SELECT client_id, client_secret 
   FROM gpt_oauth_clients 
   WHERE name = 'ChatGPT Synaps Integration';
   ```

### Step 2: Create Custom GPT

1. Go to https://chat.openai.com/gpts/editor
2. Click "Create a GPT"
3. Configure the GPT:

#### Basic Information
- **Name**: Synaps Connection Assistant
- **Description**: Discover meaningful connections based on your interests and conversations
- **Instructions**: Copy content from `gpt-instructions.md`

#### Conversation Starters
Add these starters:
- "What topics are you interested in discussing?"
- "Tell me about your current projects"
- "Help me find someone to talk to about..."
- "What kind of conversations energize you?"

#### Capabilities
- ☑️ Web Browsing (optional)
- ☐ DALL·E Image Generation
- ☑️ Code Interpreter (optional)

### Step 3: Configure Actions

1. In the GPT editor, go to "Actions"
2. Click "Create new action"
3. Import the OpenAPI schema:
   - Click "Import from URL" or "Import from file"
   - Use the `openapi-spec.yaml` file from the project root
   - Or use URL: `https://vkcxoxoxrpllcbyhdyam.supabase.co/openapi-spec.yaml` (if hosted)

4. Configure Authentication:
   - **Authentication Type**: OAuth
   - **Client ID**: [from Step 1]
   - **Client Secret**: [from Step 1]
   - **Authorization URL**: `https://vkcxoxoxrpllcbyhdyam.supabase.co/functions/v1/oauth-authorize`
   - **Token URL**: `https://vkcxoxoxrpllcbyhdyam.supabase.co/functions/v1/oauth-token`
   - **Scope**: `profile connections`
   - **Token Exchange Method**: Basic authorization header

5. Save the action configuration

### Step 4: Test the Integration

1. In the GPT editor, click "Preview"
2. Try these test conversations:

**Test 1: Profile Access**
```
You: "What do you know about me?"
GPT: [Should request OAuth access if first time]
GPT: [After authorization, shows your profile]
```

**Test 2: Finding Matches**
```
You: "I'm really into machine learning lately"
GPT: "Would you like me to find others interested in ML?"
You: "Yes"
GPT: [Shows match results with compatibility scores]
```

**Test 3: Creating Connection**
```
You: "Connect me with the first person"
GPT: [Creates connection and provides conversation link]
```

### Step 5: Publish (Optional)

1. Click "Save" in the GPT editor
2. Choose visibility:
   - **Only me**: Private testing
   - **Anyone with the link**: Share with team
   - **Public**: Submit to GPT Store

## API Endpoints

### Authentication
- `POST /oauth-authorize` - OAuth authorization endpoint
- `POST /oauth-token` - Token exchange endpoint

### Profile Management
- `POST /gpt-api-get-profile` - Get user profile
- `POST /gpt-api-update-profile` - Update user interests/mood

### Connection Discovery
- `POST /gpt-api-find-matches` - Find compatible users
- `POST /gpt-api-create-connection` - Create conversation

## User Experience Flow

### First-Time Authorization

1. User starts conversation with GPT
2. GPT requests access to Synaps
3. User clicks authorization link
4. Redirected to Synaps login (if not logged in)
5. Views consent screen showing requested permissions
6. Approves or denies access
7. Redirected back to ChatGPT
8. GPT confirms connection

### Ongoing Usage

1. User chats naturally with GPT about interests
2. GPT learns and updates profile in background
3. At relevant moments, GPT suggests matches
4. User reviews matches and chooses to connect
5. GPT creates introduction and conversation link
6. User can access conversation on Synaps

## Security & Privacy

### OAuth Security
- Authorization codes expire in 10 minutes
- Access tokens expire in 1 hour
- Refresh tokens enable seamless re-authentication
- Tokens can be revoked by user at any time

### Data Access
The GPT can only access:
- ✅ User's own profile (name, interests, mood)
- ✅ Public profiles of other users (for matching)
- ✅ Ability to create connections
- ❌ Private messages or conversations
- ❌ Email addresses or contact information
- ❌ Other users' private data

### Rate Limiting
- API calls are logged for monitoring
- Implement rate limiting if abuse detected
- User can revoke access anytime

## Troubleshooting

### "Unauthorized" Error
- Check OAuth credentials are correct
- Verify token hasn't expired
- Ensure user completed authorization flow

### "No Matches Found"
- User profile may be incomplete
- Not enough users with matching interests yet
- Try broader topic searches

### Connection Creation Fails
- Verify target user exists
- Check if conversation already exists
- Review API logs for specific error

### OAuth Redirect Issues
- Verify redirect URIs match exactly
- Check URL Configuration in Supabase
- Ensure HTTPS is used

## Monitoring & Maintenance

### Check API Usage
```sql
SELECT 
  endpoint,
  COUNT(*) as call_count,
  AVG(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as success_rate
FROM gpt_api_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint;
```

### View Active Authorizations
```sql
SELECT 
  u.email,
  t.created_at,
  t.expires_at,
  t.revoked
FROM gpt_oauth_tokens t
JOIN auth.users u ON t.user_id = u.id
WHERE t.revoked = false
ORDER BY t.created_at DESC;
```

### Monitor Match Quality
```sql
-- Check average compatibility scores
SELECT 
  AVG((response_body->>'compatibilityScore')::int) as avg_score
FROM gpt_api_logs
WHERE endpoint = '/gpt-api-find-matches'
  AND status_code = 200;
```

## Future Enhancements

### Planned Features
- [ ] Webhook notifications for new matches
- [ ] Batch connection suggestions
- [ ] Interest clustering for better matches
- [ ] User feedback on match quality
- [ ] Connection success tracking
- [ ] Multi-language support

### Advanced Matching
- Implement ML-based compatibility scoring
- Add temporal matching (timezone compatibility)
- Consider conversation style preferences
- Factor in response time patterns

## Support

For issues or questions:
1. Check the API logs in `gpt_api_logs` table
2. Review Supabase Edge Function logs
3. Test endpoints directly with curl
4. Contact support with specific error messages

## Additional Resources

- [OpenAI Custom GPTs Documentation](https://platform.openai.com/docs/actions)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Synaps API Documentation](./openapi-spec.yaml)
