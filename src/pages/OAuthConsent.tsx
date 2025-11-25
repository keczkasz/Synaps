import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle2, Sparkles, Bot, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope') || 'profile connections';

  const scopes = scope.split(' ').filter(Boolean);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login with return URL - preserve all OAuth params
      const returnUrl = `/oauth-consent?${searchParams.toString()}`;
      navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, authLoading, navigate, searchParams]);

  const handleApprove = async () => {
    if (!user) {
      toast.error('You must be logged in to authorize');
      return;
    }

    if (!clientId || !redirectUri) {
      toast.error('Missing required OAuth parameters');
      return;
    }

    setLoading(true);
    setError(null);

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
            clientId: clientId,
            redirectUri: redirectUri,
            state: state || undefined,
            scope: scope
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('OAuth authorization error:', data);
        setError(data.error_description || data.error || 'Authorization failed');
        setLoading(false);
        return;
      }

      if (data.redirect) {
        // Redirect to ChatGPT with the authorization code
        window.location.href = data.redirect;
      } else {
        setError('Failed to complete authorization - no redirect URL received');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error approving authorization:', err);
      setError('Network error - please try again');
      setLoading(false);
    }
  };

  const handleDeny = () => {
    setLoading(true);
    if (redirectUri) {
      const errorParams = new URLSearchParams({
        error: 'access_denied',
        error_description: 'User denied access',
        ...(state && { state: state })
      });
      window.location.href = `${redirectUri}?${errorParams.toString()}`;
    } else {
      navigate('/');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-400 text-sm">Preparing authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="max-w-md w-full bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-xl text-white">Invalid Request</CardTitle>
            <CardDescription className="text-slate-400">
              Missing required OAuth parameters. Please try again from ChatGPT.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          {/* App logos */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div className="h-8 w-px bg-gradient-to-b from-emerald-400/50 to-transparent" />
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center border border-slate-600 shadow-lg">
              <span className="text-xl font-bold text-white">S</span>
            </div>
          </div>

          <CardTitle className="text-2xl text-white font-semibold">
            Connect ChatGPT to Synaps
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            Allow ChatGPT to help you discover meaningful connections
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Authorizing as</p>
              <p className="text-sm text-white font-medium truncate">{user.email}</p>
            </div>
            <Lock className="h-4 w-4 text-slate-500" />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">ChatGPT will be able to:</p>
            <div className="space-y-2">
              {scopes.includes('profile') && (
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Access your profile</p>
                    <p className="text-xs text-slate-500 mt-0.5">View and update your interests, mood, and preferences</p>
                  </div>
                </div>
              )}
              {scopes.includes('connections') && (
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Find & create connections</p>
                    <p className="text-xs text-slate-500 mt-0.5">Search for matches and start conversations on your behalf</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Privacy note */}
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            By authorizing, you agree to let ChatGPT access your Synaps data.
            <br />
            You can revoke access anytime from your settings.
          </p>
        </CardContent>

        <CardFooter className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={handleDeny} 
            disabled={loading}
            className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
          >
            Deny
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Authorize
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
