import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, PackageSearch, Clock, Zap } from "lucide-react";
import { funFacts } from "@/lib/funfacts";
import { useMoves } from "@/hooks/useMoves";
import { differenceInDays, parseISO } from "date-fns";

const getRandomFact = () => {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
};

const InsightsPage = () => {
  const { activeMove } = useMoves();

  const daysUntilMove = activeMove?.move_date
    ? differenceInDays(parseISO(activeMove.move_date), new Date())
    : null;

  const progress = activeMove?.progress || 0;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Lightbulb className="h-10 w-10 text-yellow-400" />
        <h1 className="text-3xl font-bold">Umzugs-Insights</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Time Analysis Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Zeitplan-Analyse</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {daysUntilMove !== null ? (
              <>
                <div className="text-4xl font-bold text-blue-900">{daysUntilMove}</div>
                <p className="text-xs text-blue-700">
                  Tage bis zum großen Tag!
                </p>
                <div className="mt-4">
                    <p className="text-sm font-medium">Fortschritt: {progress.toFixed(0)}%</p>
                    <div className="w-full bg-blue-200 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Kein aktiver Umzug gefunden, um den Zeitplan zu analysieren.</p>
            )}
          </CardContent>
        </Card>

        {/* Fun Fact Card */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Wusstest du schon?</CardTitle>
            <Zap className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-yellow-900">
              {getRandomFact()}
            </p>
          </CardContent>
        </Card>

        {/* Lost & Found Card (Placeholder) */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Verlorene Schätze</CardTitle>
            <PackageSearch className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-4">
              Feature in Entwicklung: Behalte den Überblick über deine Kartons und Gegenstände.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
