import { database } from '../firebase/config';
import { ref, set, get, remove, update, push } from 'firebase/database';

// Helper function to create a safe ID from a URL or title
const createSafeId = (str) => {
  return str
    .toLowerCase()
    .replace(/[.#$/[\]]/g, '_')  // Replace Firebase invalid chars
    .replace(/[^a-z0-9_-]/g, '_') // Replace any other non-alphanumeric chars
    .replace(/_+/g, '_')          // Replace multiple underscores with single
    .replace(/^_|_$/g, '');       // Remove leading/trailing underscores
};

export const databaseService = {
  // Get all tools from the database
  getAllTools: async () => {
    try {
      const toolsRef = ref(database, 'tools');
      const snapshot = await get(toolsRef);
      if (snapshot.exists()) {
        // Convert object to array and add id to each tool
        return Object.entries(snapshot.val()).map(([id, tool]) => ({
          ...tool,
          id
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting tools:', error);
      throw error;
    }
  },

  // Save a new tool or update existing one
  saveTool: async (tool) => {
    try {
      const toolsRef = ref(database, 'tools');
      const toolId = tool.id || createSafeId(tool.url || tool.title);
      
      // Ensure the tool has all required fields
      const toolToSave = {
        ...tool,
        id: toolId,
        createdAt: tool.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save directly to the tools node with the toolId as the key
      await set(ref(database, `tools/${toolId}`), toolToSave)
      if (import.meta.env.DEV) {
        console.log('Tool saved to Firebase:', toolToSave)
      }
      
      return toolToSave;
    } catch (error) {
      console.error('Error saving tool:', error);
      throw error;
    }
  },

  // Update specific properties of a tool
  updateTool: async (toolId, updates) => {
    try {
      const toolRef = ref(database, `tools/${toolId}`);
      const snapshot = await get(toolRef);
      
      if (!snapshot.exists()) {
        throw new Error('Tool not found in database');
      }

      const currentTool = snapshot.val();
      const updatedTool = {
        ...currentTool,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await set(toolRef, updatedTool);
      return updatedTool;
    } catch (error) {
      console.error('Error updating tool:', error);
      throw error;
    }
  },

  // Delete a tool
  deleteTool: async (toolId) => {
    try {
      const toolRef = ref(database, `tools/${toolId}`);
      await remove(toolRef);
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error;
    }
  },

  // Synchronize database with default tools and preserve custom tools
  syncWithDefaultTools: async (defaultTools) => {
    try {
      const existingTools = await databaseService.getAllTools();
      
      // If we can't write to the database, return the default tools
      if (!existingTools) {
        if (import.meta.env.DEV) {
          console.log('No existing tools found, using default tools')
        }
        return defaultTools
      }

      // Create maps for both default and existing tools
      const defaultToolsMap = new Map(defaultTools.map(tool => [
        createSafeId(tool.url || tool.title), 
        tool
      ]));
      
      // Convert existing tools array to a map using their IDs
      const existingToolsMap = new Map(existingTools.map(tool => [
        tool.id,
        tool
      ]));
      
      // Start with all existing tools
      const mergedTools = [...existingTools];
      
      // Add any default tools that don't exist yet
      defaultTools.forEach(defaultTool => {
        const safeId = createSafeId(defaultTool.url || defaultTool.title);
        if (!existingToolsMap.has(safeId)) {
          // Only add default tool if it doesn't exist
          mergedTools.push({
            ...defaultTool,
            id: safeId,
            adminOnly: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      try {
        // Update database with merged tools
        const toolsRef = ref(database, 'tools');
        const toolsObject = mergedTools.reduce((acc, tool) => {
          acc[tool.id] = tool;
          return acc;
        }, {});
        
        await set(toolsRef, toolsObject)
        if (import.meta.env.DEV) {
          console.log('Successfully synchronized tools with database')
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Unable to update database, using merged tools anyway:', error)
        }
      }

      return mergedTools;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Error synchronizing tools:', error)
      }
      // Return default tools as fallback
      return defaultTools;
    }
  },

  // Initialize database with default tools if empty
  initializeDefaultTools: async (defaultTools) => {
    try {
      const toolsRef = ref(database, 'tools');
      const snapshot = await get(toolsRef);
      
      if (!snapshot.exists()) {
        if (import.meta.env.DEV) {
          console.log('No tools found in database, initializing with defaults')
        }
        const toolsObject = defaultTools.reduce((acc, tool) => {
          const safeId = createSafeId(tool.url || tool.title);
          acc[safeId] = {
            ...tool,
            id: safeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return acc;
        }, {});
        
        await set(toolsRef, toolsObject)
        if (import.meta.env.DEV) {
          console.log('Successfully initialized database with default tools')
        }
        return Object.values(toolsObject);
      }
      
      // If tools exist, synchronize with defaults
      return databaseService.syncWithDefaultTools(defaultTools);
    } catch (error) {
      console.error('Error initializing tools:', error);
      throw error;
    }
  }
}; 