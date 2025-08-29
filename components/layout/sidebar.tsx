import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Inbox, 
  Calendar, 
  CheckCircle, 
  Tag, 
  Menu,
  X,
  Settings,
  Moon,
  Sun,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/ui/badge';
import { useTranslation, useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/hooks/use-preferences';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { useTags } from '@/lib/hooks/use-todos';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, className }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { locale, setLocale } = useI18n();
  const { theme, effectiveTheme, toggleTheme } = useTheme();
  const { isOnline } = useOnlineStatus();
  const { tags, loading: tagsLoading } = useTags();

  const navigationItems = [
    {
      href: '/',
      label: t('nav.inbox'),
      icon: Inbox,
      exact: true,
    },
    {
      href: '/today',
      label: t('nav.today'),
      icon: Calendar,
    },
    {
      href: '/completed',
      label: t('nav.completed'),
      icon: CheckCircle,
    },
  ];

  const isActiveRoute = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'th' : 'en');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className=\"fixed inset-0 z-40 bg-black/50 lg:hidden\"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform bg-background border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className=\"flex h-full flex-col\">
          {/* Header */}
          <div className=\"flex items-center justify-between p-4 border-b border-border\">
            <div className=\"flex items-center space-x-2\">
              <div className=\"w-8 h-8 bg-primary rounded-lg flex items-center justify-center\">
                <CheckCircle className=\"w-5 h-5 text-primary-foreground\" />
              </div>
              <h1 className=\"text-lg font-semibold\">Todo PWA</h1>
            </div>
            
            {/* Close button (mobile only) */}
            <Button
              variant=\"ghost\"
              size=\"icon\"
              onClick={onToggle}
              className=\"lg:hidden\"
              aria-label=\"Close sidebar\"
            >
              <X className=\"h-5 w-5\" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className=\"flex-1 px-4 py-4 space-y-2\">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href, item.exact);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className=\"h-5 w-5\" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Tags section */}
          {!tagsLoading && tags.length > 0 && (
            <div className=\"px-4 py-2 border-t border-border\">
              <div className=\"flex items-center space-x-2 mb-3\">
                <Tag className=\"h-4 w-4 text-muted-foreground\" />
                <span className=\"text-sm font-medium text-muted-foreground\">
                  {t('nav.tags')}
                </span>
              </div>
              <div className=\"space-y-1 max-h-32 overflow-y-auto\">
                {tags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={cn(
                      'block px-3 py-1 rounded text-xs transition-colors',
                      pathname === `/tag/${encodeURIComponent(tag)}`
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    #{tag}
                  </Link>
                ))}
                {tags.length > 10 && (
                  <div className=\"px-3 py-1 text-xs text-muted-foreground\">
                    +{tags.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings and status */}
          <div className=\"p-4 border-t border-border space-y-3\">
            {/* Online status */}
            <div className=\"flex items-center space-x-2 text-sm\">
              {isOnline ? (
                <>
                  <Wifi className=\"h-4 w-4 text-green-500\" />
                  <span className=\"text-muted-foreground\">{t('common.online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className=\"h-4 w-4 text-red-500\" />
                  <span className=\"text-muted-foreground\">{t('common.offline')}</span>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm text-muted-foreground\">{t('settings.theme')}</span>
              <Button
                variant=\"ghost\"
                size=\"icon\"
                onClick={toggleTheme}
                aria-label=\"Toggle theme\"
              >
                {effectiveTheme === 'dark' ? (
                  <Sun className=\"h-4 w-4\" />
                ) : (
                  <Moon className=\"h-4 w-4\" />
                )}
              </Button>
            </div>

            {/* Language toggle */}
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm text-muted-foreground\">{t('settings.language')}</span>
              <Button
                variant=\"ghost\"
                size=\"sm\"
                onClick={toggleLanguage}
                className=\"h-8 px-2 text-xs\"
              >
                <Globe className=\"h-3 w-3 mr-1\" />
                {locale.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.displayName = 'Sidebar';

export { Sidebar };"