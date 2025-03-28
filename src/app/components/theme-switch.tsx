import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTheme } from '@heroui/use-theme';

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      isIconOnly
      variant="light"
      onPress={toggleTheme}
      aria-label="Toggle theme"
    >
      <Icon
        icon={theme === 'light' ? 'lucide:moon' : 'lucide:sun'}
        className="w-5 h-5"
      />
    </Button>
  );
};

export default ThemeSwitch;
