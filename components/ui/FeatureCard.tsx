import { LucideIcon } from "lucide-react";

// Define FeatureCard component with Lucide React icons
interface FeatureCardProps {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: IconComponent,
  iconColor,
  bgColor,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-3">
        <div className={`${bgColor} p-2 rounded-lg mr-4`}>
          <IconComponent className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
