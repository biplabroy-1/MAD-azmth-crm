import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureTabProps {
  icon: ReactNode;
  title: string;
  description: string;
  isActive: boolean;
}

export const FeatureTab = ({
  icon,
  title,
  description,
  isActive,
}: FeatureTabProps) => {
  return (
    <div
      className={`
        w-full flex items-center gap-3 p-4 rounded-xl 
        transition-all duration-300 relative
        ${isActive ? "glass shadow-lg shadow-primary/10" : "hover:glass-hover"}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 top-0 w-1 h-full  rounded-l-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`${isActive ? "" : "text-muted-foreground"}`}
        >
          {icon}
        </div>
        <div className="text-left min-w-0">
          <h3
            className={`font-semibold truncate text-sm ${
              isActive ? "" : ""
            }`}
          >
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
