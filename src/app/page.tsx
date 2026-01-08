import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Music,
  Users,
  Calendar,
  List,
  Play,
  Bell,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    title: "Songs",
    description: "Manage your band's song library with lyrics, keys, and metadata",
    href: "/songs",
    icon: Music,
    color: "text-blue-500",
  },
  {
    title: "Groups",
    description: "Manage multiple bands and invite members",
    href: "/groups",
    icon: Users,
    color: "text-green-500",
  },
  {
    title: "Calendar",
    description: "View and manage upcoming performances",
    href: "/calendar",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    title: "Rounds",
    description: "Create and organize setlists for your performances",
    href: "/rounds",
    icon: List,
    color: "text-orange-500",
  },
  {
    title: "Performance",
    description: "Start a performance session and export to PDF",
    href: "/performance",
    icon: Play,
    color: "text-red-500",
  },
  {
    title: "Notifications",
    description: "Enable push notifications for upcoming shows",
    href: "/notifications",
    icon: Bell,
    color: "text-yellow-500",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header Section */}
        <div className="mb-12 text-center md:mb-16">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Welcome to Band Manager
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Organize your songs, create setlists, and manage performances all in
            one place
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="group transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className={`rounded-lg bg-muted p-2 ${action.color} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button className="w-full group-hover:gap-2" variant="default">
                      Go to {action.title}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}


