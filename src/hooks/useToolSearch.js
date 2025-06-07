import { useMemo } from 'react'

export const useToolSearch = (tools, searchTerm, userEmail, isAdminUser) => {
  return useMemo(() => {
    if (!tools) return [];


    // First filter out admin-only tools if user is not admin
    const accessibleTools = tools.filter(tool => {
      const isAdminOnly = tool.adminOnly === true;
      const shouldShow = isAdminOnly ? isAdminUser : true;
      
      return shouldShow;
    });


    if (!searchTerm) return accessibleTools;

    const searchTermLower = searchTerm.toLowerCase();
    return accessibleTools.filter(tool => {
      const titleMatch = tool.title?.toLowerCase().includes(searchTermLower);
      const descMatch = tool.desc?.toLowerCase().includes(searchTermLower);
      const keywordMatch = tool.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchTermLower)
      );
      
      return titleMatch || descMatch || keywordMatch;
    });
  }, [tools, searchTerm, userEmail, isAdminUser]);
};
