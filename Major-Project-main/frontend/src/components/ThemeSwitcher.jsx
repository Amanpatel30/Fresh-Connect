import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const themeIcons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    purple: <Sun className="w-4 h-4 text-purple-500" />,
    forest: <Sun className="w-4 h-4 text-emerald-500" />
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Theme switcher"
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="grid grid-cols-2 gap-2 p-2">
              {Object.keys(themes).map((theme) => (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentTheme(theme);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-xl flex items-center gap-2 transition-colors
                    ${currentTheme === theme 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {themeIcons[theme]}
                  <span className="capitalize text-sm">{theme}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;