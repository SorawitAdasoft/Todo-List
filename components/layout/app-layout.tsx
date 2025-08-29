import * as React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePreferences } from '@/lib/hooks/use-preferences';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNewTodo?: () => void;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  description,
  actions,
  searchQuery = '',
  onSearchChange,
  onNewTodo,
  className
}) => {
  const { t } = useTranslation();
  const { preferences, toggleSidebar } = usePreferences();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Focus search input when / is pressed
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || 
                              target.tagName === 'TEXTAREA' || 
                              target.contentEditable === 'true';
        
        if (!isInputElement) {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className=\"h-screen flex bg-background\">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      
      {/* Main content */}
      <div className=\"flex-1 flex flex-col min-w-0 lg:ml-0\">
        {/* Header */}
        <header className=\"sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border\">
          <div className=\"flex items-center justify-between px-4 py-3 lg:px-6\">
            {/* Left section */}
            <div className=\"flex items-center space-x-3\">
              {/* Mobile menu button */}
              <Button
                variant=\"ghost\"
                size=\"icon\"
                onClick={handleSidebarToggle}
                className=\"lg:hidden\"
                aria-label=\"Open sidebar\"
              >
                <Menu className=\"h-5 w-5\" />
              </Button>
              
              {/* Title and description */}
              <div className=\"min-w-0\">
                {title && (
                  <h1 className=\"text-lg font-semibold truncate\">{title}</h1>
                )}
                {description && (
                  <p className=\"text-sm text-muted-foreground truncate\">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className=\"flex items-center space-x-3\">
              {/* Search */}
              {onSearchChange && (
                <div className=\"relative hidden sm:block w-64\">
                  <Search className=\"absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground\" />
                  <Input
                    ref={searchRef}
                    placeholder={`${t('common.search')}...`}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className=\"pl-8\"
                  />
                </div>
              )}
              
              {/* Mobile search button */}
              {onSearchChange && (
                <Button
                  variant=\"ghost\"
                  size=\"icon\"
                  onClick={() => searchRef.current?.focus()}
                  className=\"sm:hidden\"
                  aria-label={t('common.search')}
                >
                  <Search className=\"h-5 w-5\" />
                </Button>
              )}
              
              {/* New todo button */}
              {onNewTodo && (
                <Button
                  onClick={onNewTodo}
                  size=\"sm\"
                  className=\"flex items-center space-x-2\"
                >
                  <Plus className=\"h-4 w-4\" />
                  <span className=\"hidden sm:inline\">{t('todo.addTodo')}</span>
                </Button>
              )}
              
              {/* Custom actions */}
              {actions}
            </div>
          </div>
          
          {/* Mobile search */}
          {onSearchChange && (
            <div className=\"px-4 pb-3 sm:hidden\">
              <div className=\"relative\">
                <Search className=\"absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground\" />
                <Input
                  placeholder={`${t('common.search')}...`}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className=\"pl-8\"
                />
              </div>
            </div>
          )}
        </header>

        {/* Main content area */}
        <main className={cn('flex-1 overflow-auto', className)}>
          <div className=\"container mx-auto px-4 py-6 lg:px-6 max-w-4xl\">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

AppLayout.displayName = 'AppLayout';

export { AppLayout };"