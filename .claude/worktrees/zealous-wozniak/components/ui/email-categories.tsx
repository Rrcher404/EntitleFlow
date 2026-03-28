'use client';

import React, { useState, useMemo } from 'react';
import { 
  Inbox,
  SendHorizontal,
  Trash,
  MailX,
  SquarePen,
  Star,
  Archive
} from 'lucide-react';

interface CategoriesSectionProps {
  onCategoryClick?: (folderType: string) => void;
  systemUnreadCounts?: Record<string, number>;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  onCategoryClick,
  systemUnreadCounts = {}
}) => {
  const [selectedSystemFolder, setSelectedSystemFolder] = useState<string | null>('inbox');

  const systemFolders = useMemo(() => {
    const systemFolderConfig = [
      { name: 'Inbox', icon: Inbox, folderType: 'inbox' },
      { name: 'Sent', icon: SendHorizontal, folderType: 'sent' },
      { name: 'Drafts', icon: SquarePen, folderType: 'drafts' },
      { name: 'Trash', icon: Trash, folderType: 'trash' },
      { name: 'Spam', icon: MailX, folderType: 'spam' },
      { name: 'Starred', icon: Star, folderType: 'starred' },
      { name: 'Archive', icon: Archive, folderType: 'archive' }
    ];

    return systemFolderConfig.map(folder => {
      const systemLabelIdMap: Record<string, string> = {
        'Inbox': 'INBOX', 'Sent': 'SENT', 'Drafts': 'DRAFT',
        'Trash': 'TRASH', 'Spam': 'SPAM', 'Starred': 'STARRED', 'Archive': 'ARCHIVE'
      };
      const systemLabelId = systemLabelIdMap[folder.name];
      const unreadCount = systemLabelId ? (systemUnreadCounts[systemLabelId] || 0) : 0;
      return {
        ...folder,
        unreadCount,
        color: selectedSystemFolder === folder.folderType ? '#0f3c35' : '#8f8f8f'
      };
    });
  }, [systemUnreadCounts, selectedSystemFolder]);

  const handleSystemFolderClick = (folderType: string) => {
    setSelectedSystemFolder(folderType);
    onCategoryClick?.(folderType);
  };

  return (
    <div className="p-3">
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Review Mail
        </h4>
      </div>
      <div className="space-y-0.5">
        {systemFolders.map((folder) => {
          const IconComponent = folder.icon;
          const isSelected = selectedSystemFolder === folder.folderType;
          return (
            <button
              key={folder.name}
              onClick={() => handleSystemFolderClick(folder.folderType)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-lg transition-colors group ${
                isSelected ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <IconComponent
                  size={16}
                  className="flex-shrink-0 transition-transform duration-200 group-hover:-rotate-6"
                  style={{ color: folder.color }}
                />
                <span className="truncate">{folder.name}</span>
              </div>
              {folder.unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0 ml-2"
                  style={{ backgroundColor: '#0f3c3515', color: '#0f3c35' }}>
                  {folder.unreadCount > 99 ? '99+' : folder.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesSection;
