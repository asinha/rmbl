// Define FeatureCard component first
interface FeatureCardProps {
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  iconColor,
  bgColor,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-3">
        <div className={`${bgColor} p-2 rounded-lg mr-4`}>
          <span className={`material-icons ${iconColor}`}>{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
