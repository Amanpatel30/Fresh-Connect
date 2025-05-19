import { motion } from 'framer-motion';

const items = [
  { name: 'Tomatoes', color: 'bg-red-500' },
  { name: 'Lettuce', color: 'bg-green-500' },
  { name: 'Carrots', color: 'bg-orange-500' },
  { name: 'Broccoli', color: 'bg-green-600' },
  { name: 'Bell Peppers', color: 'bg-yellow-500' },
  { name: 'Eggplant', color: 'bg-purple-500' },
];

export default function VegetableGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {items.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="relative group cursor-pointer"
        >
          <div className={`aspect-square rounded-2xl ${item.color}/10 p-6 
            flex items-center justify-center overflow-hidden
            border-2 border-${item.color}/20 transition-colors
            hover:border-${item.color}/40`}
          >
            <span className={`text-lg font-medium text-${item.color}`}>
              {item.name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 