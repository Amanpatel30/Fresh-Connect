import { motion } from 'framer-motion';
import { Leaf, Users, ShoppingBag, Clock } from 'lucide-react';

const stats = [
  { 
    icon: Leaf,
    label: 'Fresh Produce',
    value: '1000+',
    color: 'green'
  },
  {
    icon: Users,
    label: 'Happy Customers',
    value: '5001+',
    color: 'blue'
  },
  {
    icon: ShoppingBag,
    label: 'Daily Orders',
    value: '200+',
    color: 'orange'
  },
  {
    icon: Clock,
    label: 'Quick Delivery',
    value: '30min',
    color: 'purple'
  }
];

export default function StatsDisplay() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-${stat.color}-50 p-6 rounded-2xl
            border border-${stat.color}-100`}
        >
          <stat.icon className={`w-8 h-8 text-${stat.color}-500 mb-4`} />
          <h3 className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
            {stat.value}
          </h3>
          <p className="text-gray-600">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
} 