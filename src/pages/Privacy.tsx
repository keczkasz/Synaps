/**
 * Copyright © 2025 Dawid Konopka
 * All rights reserved.
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Synaps</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
            ← Back to Home
          </Button>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-card p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 13, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Welcome to Synaps ("we," "our," or "us"). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, and protect your personal information when you use our connection platform and ChatGPT integration.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-foreground">Account Information</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Email address</li>
                <li>Display name</li>
                <li>Profile information (bio, interests, connection goals)</li>
                <li>Avatar/profile picture (if provided)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4">Conversation Data</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Messages you send through our platform</li>
                <li>AI conversation history with our Synaps Connection Assistant</li>
                <li>Topics and interests identified from your conversations</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4">ChatGPT Integration Data</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>OAuth authentication tokens</li>
                <li>Profile updates made through ChatGPT</li>
                <li>Connection requests initiated via ChatGPT</li>
                <li>API access logs for security and debugging</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4">Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Login timestamps and session information</li>
                <li>Connection activity and matching requests</li>
                <li>Platform interaction patterns</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
            <p className="text-foreground/80 leading-relaxed">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Provide and maintain our connection matching services</li>
              <li>Enable the ChatGPT integration and API functionality</li>
              <li>Match you with other users based on shared interests and conversation topics</li>
              <li>Facilitate conversations between connected users</li>
              <li>Improve our AI-powered matching algorithms</li>
              <li>Send you service-related notifications and updates</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Analyze usage patterns to improve our services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">ChatGPT Integration</h2>
            <p className="text-foreground/80 leading-relaxed">
              When you connect your Synaps account with ChatGPT:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>ChatGPT can access your profile information to suggest connections</li>
              <li>ChatGPT can update your interests based on your conversations</li>
              <li>We log API calls for security and debugging purposes</li>
              <li>You can revoke ChatGPT access at any time through your account settings</li>
              <li>We do not share your data with ChatGPT beyond what's necessary for the integration</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Sharing and Disclosure</h2>
            <p className="text-foreground/80 leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>With other users:</strong> Your profile information (name, interests, bio) is visible to matched users</li>
              <li><strong>With ChatGPT:</strong> Only when you explicitly authorize the integration</li>
              <li><strong>Service providers:</strong> We use Supabase for backend services and authentication</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure OAuth 2.0 authentication for ChatGPT integration</li>
              <li>Row Level Security (RLS) policies on our database</li>
              <li>Regular security audits and updates</li>
              <li>Limited data access based on user permissions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
            <p className="text-foreground/80 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Revoke ChatGPT integration access</li>
              <li>Export your data in a portable format</li>
              <li>Object to certain data processing activities</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your data for as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Personal information is deleted within 30 days</li>
              <li>Conversation data with other users is anonymized</li>
              <li>OAuth tokens are immediately revoked</li>
              <li>Backup copies are purged within 90 days</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
            <p className="text-foreground/80 leading-relaxed">Our platform integrates with:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Supabase:</strong> Backend infrastructure and authentication</li>
              <li><strong>ChatGPT/OpenAI:</strong> AI-powered connection suggestions (when authorized)</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-3">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Synaps is not intended for users under 18 years of age. We do not knowingly collect information from children under 18.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Changes to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform. Continued use of Synaps after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <div className="bg-muted/30 rounded-lg p-4 space-y-1 text-foreground/80">
              <p><strong>Email:</strong> privacy@synaps.app</p>
              <p><strong>Platform:</strong> Via the contact form on our website</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">GDPR Compliance</h2>
            <p className="text-foreground/80 leading-relaxed">
              For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). You have additional rights under GDPR, including the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Copyright © 2025 Dawid Konopka. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
