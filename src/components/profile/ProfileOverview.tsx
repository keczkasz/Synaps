import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Sparkles, Heart, Brain, Target } from "lucide-react";

export function ProfileOverview() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="p-8 shadow-card border-0 bg-gradient-warm">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage src="/api/placeholder/200/200" />
              <AvatarFallback className="bg-gradient-primary text-white text-3xl font-medium">
                You
              </AvatarFallback>
            </Avatar>
            <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-floating">
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground">
                Your AI companion is learning more about you with every conversation
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className="rounded-full bg-emotion-creative text-foreground border-0">Creative Spirit</Badge>
              <Badge className="rounded-full bg-emotion-calm text-foreground border-0">Deep Thinker</Badge>
              <Badge className="rounded-full bg-emotion-focused text-foreground border-0">Goal-Oriented</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6 shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">AI Insights About You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Emotional Patterns</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You tend to seek meaningful connections during reflective moments and value emotional authenticity in conversations.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Communication Style</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You communicate with empathy and depth, often asking thoughtful questions and sharing personal insights.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Connection Goals</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You're interested in creative collaboration, emotional support, and finding people who share your values and interests.
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-soft">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Connected with Alex Chen</p>
              <p className="text-xs text-muted-foreground">Started a conversation about creative projects</p>
            </div>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-soft">
            <div className="w-2 h-2 rounded-full bg-emotion-calm"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">AI Session Completed</p>
              <p className="text-xs text-muted-foreground">Explored your current emotional state and goals</p>
            </div>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-soft">
            <div className="w-2 h-2 rounded-full bg-emotion-energetic"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Profile Updated</p>
              <p className="text-xs text-muted-foreground">Added interests in philosophy and creative writing</p>
            </div>
            <span className="text-xs text-muted-foreground">3 days ago</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button className="rounded-2xl px-6 shadow-card">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
        <Button variant="outline" className="rounded-2xl px-6">
          Privacy Settings
        </Button>
      </div>
    </div>
  );
}