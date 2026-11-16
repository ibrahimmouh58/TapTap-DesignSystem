import { Icon, type IconName } from "./Icon";
import { icons } from "./icons.generated";

// Display names of the icon families (folders in icons/svg)
const titles: Record<string, string> = {
  arrows: "Arrows",
  charts: "Charts",
  base: "Base",
  suggest: "Suggest",
  edit: "Edit",
};

/** Every icon, grouped by family, in both variants (line and filled) */
export function IconGallery() {
  const names = Object.keys(icons) as IconName[];
  const families = [...new Set(names.map((n) => icons[n].family))];

  return (
    <main className="mx-auto w-full max-w-5xl px-10 py-12">
      {families.map((family) => (
        <section key={family} className="mb-16">
          <h2 className="text-h3 font-medium text-neutral-700">{titles[family] ?? family}</h2>

          <div className="mt-8 grid grid-cols-2 gap-y-12 sm:grid-cols-4 lg:grid-cols-6">
            {names
              .filter((n) => icons[n].family === family)
              .map((name) => (
                <div key={name} className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-6 text-neutral-500">
                    <Icon name={name} size={20} />
                    <Icon name={name} variant="filled" size={20} />
                  </div>
                  <span className="text-caption text-neutral-600">{name}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}