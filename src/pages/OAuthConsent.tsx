import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('ChatGPT');

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope') || 'profile connections';

  const scopes = scope.split(' ').filter(Boolean);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login with return URL
      const returnUrl = `/oauth-consent?${searchParams.toString()}`;
      navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, authLoading, navigate, searchParams]);

  const handleApprove = async () => {
    if (!user) {
      toast.error('You must be logged in to authorize');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-authorize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            approved: true,
            userId: user.id,
            clientId,
            redirectUri,
            state
          })
        }
      );

      const data = await response.json();

      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        toast.error('Failed to complete authorization');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error approving authorization:', error);
      toast.error('Failed to authorize application');
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (redirectUri) {
      const errorUrl = `${redirectUri}?error=access_denied&error_description=User denied access${state ? `&state=${state}` : ''}`;
      window.location.href = errorUrl;
    } else {
      navigate('/');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>Missing required OAuth parameters</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Authorize {clientName}</CardTitle>
          <CardDescription>
            {clientName} would like to access your Synaps account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong className="font-medium">Logged in as:</strong>
              <br />
              {user.email}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">This application will be able to:</p>
            <ul className="space-y-2">
              {scopes.includes('profile') && (
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View your profile information (name, interests, mood)</span>
                </li>
              )}
              {scopes.includes('connections') && (
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Find and create connections with other users on your behalf</span>
                </li>
              )}
              {scopes.includes('profile') && (
                <li className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Update your interests and conversation preferences</span>
                </li>
              )}
            </ul>
          </div>

          <Alert variant="default">
            <AlertDescription className="text-xs">
              By authorizing, you allow {clientName} to access your Synaps data as described above. 
              You can revoke access at any time from your profile settings.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDeny} 
            disabled={loading}
            className="flex-1"
          >
            Deny
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authorize'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
