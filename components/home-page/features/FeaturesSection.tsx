import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureTab } from "./FeatureTab";
import { FeatureContent } from "./FeatureContent";
import { features } from "@/components/home-page/config/features";

export const FeaturesSection = () => {
  return (
    <section className="container px-4 py-16  mx-auto">
      {/* Header Section */}
      <div className=" mb-12">
        <h2 className="text-4xl md:text-5xl font-normal mb-4 tracking-tight text-center">
          Product 
          <span className="text-gradient font-medium"> Highlights</span>
        </h2>
        <p className="text-lg text-gray-400 text-center">
          Powerful features that make azmth the ultimate AI call management
          solution.
        </p>
      </div>

      <Tabs defaultValue={features[0].title} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left side - Tab triggers */}
          <div className="md:col-span-5 space-y-2">
            <TabsList className="flex flex-col w-full bg-transparent h-auto p-0 space-y-2">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.title}
                  value={feature.title}
                  className="w-full data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                >
                  <FeatureTab
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    isActive={false}
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Right side - Tab content with images */}
          <div className="md:col-span-7">
            {features.map((feature) => (
              <TabsContent
                key={feature.title}
                value={feature.title}
                className="mt-0 h-full"
              >
                <FeatureContent image={feature.image} title={feature.title} />
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </section>
  );
};
