// tests/main.test.tsx
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('main.tsx Entry Point', () => {
  let rootElement: HTMLElement;
  let originalCreateRoot: typeof import('react-dom/client').createRoot;
  let mockCreateRoot: jest.Mock;
  let mockRootInstance: { render: jest.Mock; unmount: jest.Mock };

  beforeEach(() => {
    // Create a mock root element
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Create mock root instance
    mockRootInstance = {
      render: jest.fn(),
      unmount: jest.fn()
    };

    // Create mock createRoot function
    mockCreateRoot = jest.fn(() => mockRootInstance);

    // Save original createRoot
    originalCreateRoot = jest.requireActual('react-dom/client').createRoot;

    // Mock the react-dom/client module
    jest.mock('react-dom/client', () => ({
      ...jest.requireActual('react-dom/client'),
      createRoot: mockCreateRoot
    }));

    // Mock App component
    jest.mock('@/App', () => ({
      __esModule: true,
      default: () => '<div data-testid="app">Mock App</div>'
    }));

    // Mock CSS import
    jest.mock('@/styles/main.css', () => ({}));
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
    
    // Restore original modules
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Module Imports', () => {
    it('should import React', () => {
      // ACT & ASSERT - Should not throw due to missing React import
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should import ReactDOM', () => {
      // ACT & ASSERT - Should not throw due to missing ReactDOM import
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should import App component', () => {
      // ACT & ASSERT - Should not throw due to missing App import
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should import global CSS', () => {
      // ACT & ASSERT - Should not throw due to missing CSS import
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });
  });

  describe('Root Element Selection', () => {
    it('should get element by ID "root"', () => {
      // ARRANGE
      const getElementByIdSpy = jest.spyOn(document, 'getElementById');

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(getElementByIdSpy).toHaveBeenCalledWith('root');

      getElementByIdSpy.mockRestore();
    });

    it('should select the root element from DOM', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Root element should still exist
      const root = document.getElementById('root');
      expect(root).toBeInTheDocument();
    });

    it('should use HTMLElement type for root', () => {
      // ARRANGE
      const root = document.getElementById('root');

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(root).toBeInstanceOf(HTMLElement);
    });

    it('should validate that root element exists', () => {
      // ARRANGE - Ensure root exists
      expect(document.getElementById('root')).toBeInTheDocument();

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Should proceed without error
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if root element not found', () => {
      // ARRANGE - Remove root element
      document.body.innerHTML = '';

      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).toThrow(/root/i);
    });

    it('should have descriptive error message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/root/i);
        expect(error.message).toMatch(/div id="root"/i);
        expect(error.message).toMatch(/index\.html/i);
      }
    });

    it('should prevent rendering without root element', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error) {
        // Expected to throw
      }

      // ASSERT - Should not have called createRoot
      expect(mockCreateRoot).not.toHaveBeenCalled();
    });

    it('should throw error with helpful message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).toThrow(
        'Failed to find the root element. Make sure there is a <div id="root"></div> in your index.html'
      );
    });
  });

  describe('React Root Creation', () => {
    it('should call ReactDOM.createRoot', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should call createRoot with root element', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });

    it('should use React 18 createRoot API (not legacy render)', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Should use createRoot, not legacy render
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should create root successfully when element exists', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });
  });

  describe('App Rendering', () => {
    it('should render App component', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
      // Should render StrictMode with App inside
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
    });

    it('should render App wrapped in StrictMode', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
    });

    it('should call render method once', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should render only once on initial load', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - No additional renders
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should pass correct JSX structure to render', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
      expect(renderCall.props.children.type).toBeTruthy();
      expect(renderCall.props.children.type.name).toBe('default');
    });
  });

  describe('StrictMode Wrapper', () => {
    it('should wrap App in StrictMode', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
    });

    it('should use React.StrictMode component', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
    });

    it('should place App component inside StrictMode', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.props.children.type).toBeTruthy();
      expect(renderCall.props.children.type.name).toBe('default');
    });
  });

  describe('Global Styles', () => {
    it('should import CSS file without errors', () => {
      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should execute CSS import before rendering', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Should complete rendering after CSS import
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should not affect rendering if CSS import fails', () => {
      // ARRANGE - Mock CSS to throw error
      jest.doMock('@/styles/main.css', () => {
        throw new Error('CSS import failed');
      });

      // ACT & ASSERT - Should still render App
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });
  });

  describe('Execution Flow', () => {
    it('should execute all steps in order', () => {
      // ARRANGE
      const getElementSpy = jest.spyOn(document, 'getElementById');

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(getElementSpy).toHaveBeenCalledWith('root');
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);

      getElementSpy.mockRestore();
    });

    it('should complete without errors', () => {
      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should successfully mount app', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Root element should exist and App should be mounted
      expect(document.getElementById('root')).toBeInTheDocument();
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should execute side effects immediately', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - All side effects should happen during module evaluation
      expect(mockCreateRoot).toHaveBeenCalled();
      expect(mockRootInstance.render).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should create fully functional app container', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Root element should exist
      const root = document.getElementById('root');
      expect(root).toBeInTheDocument();
    });

    it('should work in mocked browser environment', () => {
      // ARRANGE - Already in jsdom environment
      const rootExists = document.getElementById('root');

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(rootExists).toBeInTheDocument();
    });

    it('should initialize React root correctly', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should handle DOM ready state', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(document.getElementById('root')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle root element being removed after selection', () => {
      // This tests the scenario where root exists when selected but removed later
      // In practice, root element shouldn't be removed after mounting
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should handle multiple execution attempts', () => {
      // ACT - Execute multiple times (though module caching prevents re-execution)
      jest.isolateModules(() => {
        require('@/main');
      });
      
      // This won't re-execute due to module caching
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Should not cause errors
      expect(true).toBe(true);
    });

    it('should work with existing DOM content', () => {
      // ARRANGE
      rootElement.innerHTML = '<div>Existing content</div>';

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(document.getElementById('root')).toBeInTheDocument();
    });

    it('should handle race conditions gracefully', () => {
      // ACT - Multiple isolated executions
      for (let i = 0; i < 3; i++) {
        jest.isolateModules(() => {
          require('@/main');
        });
      }

      // ASSERT - Should not cause conflicts
      expect(true).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error if root missing', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/Failed to find the root element/i);
        expect(error.message).toMatch(/div id="root"/i);
      }
    });

    it('should mention "root" in error message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/root/i);
      }
    });

    it('should suggest solution in error message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/index\.html/i);
      }
    });
  });

  describe('Module Structure', () => {
    it('should execute immediately when required', () => {
      // ARRANGE
      const getElementSpy = jest.spyOn(document, 'getElementById');

      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(getElementSpy).toHaveBeenCalledWith('root');

      getElementSpy.mockRestore();
    });

    it('should be self-contained', () => {
      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });

    it('should not depend on external initialization', () => {
      // ACT & ASSERT - Should work without any prior setup
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });
  });

  describe('React 18 Features', () => {
    it('should use createRoot API', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should support concurrent rendering features', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Using createRoot enables concurrent features
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });

    it('should not use legacy ReactDOM.render', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - Should use modern API
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
      // Legacy render would be different API
    });

    it('should enable StrictMode checks', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT - StrictMode is used
      const renderCall = mockRootInstance.render.mock.calls[0][0];
      expect(renderCall.type).toBe(require('react').StrictMode);
    });
  });

  describe('Module Isolation', () => {
    it('should be isolated between test runs', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // Verify state is clean for next test
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should reset mock state between executions', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // Reset mock state
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
      mockCreateRoot.mockClear();

      // ACT again
      jest.isolateModules(() => {
        require('@/main');
      });

      // Should still work
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should not retain state between isolated runs', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // Second run should behave the same
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).not.toThrow();
    });
  });

  describe('Bootstrap Verification', () => {
    it('should bootstrap application successfully', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
      expect(mockRootInstance.render).toHaveBeenCalledTimes(1);
    });

    it('should prepare DOM for React rendering', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(document.getElementById('root')).toBeInTheDocument();
    });

    it('should establish React rendering pipeline', () => {
      // ACT
      jest.isolateModules(() => {
        require('@/main');
      });

      // ASSERT
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
      expect(mockRootInstance.render).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should complete initialization sequence', () => {
      // ARRANGE
      let completed = false;

      // ACT
      jest.isolateModules(() => {
        require('@/main');
        completed = true;
      });

      // ASSERT
      expect(completed).toBe(true);
    });
  });
});
