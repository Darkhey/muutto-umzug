import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const SentryTestButton = () => {
  const triggerError = () => {
    throw new Error("This is your first error!");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sentry Error Testing</CardTitle>
        <CardDescription>
          Click the button below to trigger a test error and verify Sentry integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={triggerError}
          variant="destructive"
          className="w-full"
        >
          Break the world
        </Button>
      </CardContent>
    </Card>
  );
};