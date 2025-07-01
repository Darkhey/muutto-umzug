import { Checkbox } from "@/components/ui/checkbox";

const commonTasks = [
  "Mietvertrag kündigen",
  "Umzugsunternehmen beauftragen",
  "Kartons besorgen",
  "Strom ummelden",
  "Internet ummelden",
  "Adresse bei Banken ändern",
  "Einwohnermeldeamt ummelden",
] as const;

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Einstellungen</h1>
      <p className="text-muted-foreground mb-6">
        Hier kannst du deine App-Einstellungen anpassen.
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Standardaufgaben</h2>
          <p className="text-sm text-gray-600 mb-4">
            Platzhalter f&uuml;r die h&auml;ufigsten To-dos rund um den Umzug.
          </p>
          <div className="space-y-2">
            {commonTasks.map((task) => (
              <div key={task} className="flex items-center space-x-2">
                <Checkbox id={task} disabled />
                <label htmlFor={task} className="text-sm">
                  {task}
                </label>
              </div>
            ))}
          </div>
        </section>
        {/* Future settings sections will go here */}
      </div>
    </div>
  );
};
export default Settings;
