import webpackConfig from '../webpack.config';
import path from 'path';
import type { Configuration } from 'webpack';

// Mock path.resolve to ensure consistent output for path-related tests
// This is important because __dirname can vary based on test runner execution context.
jest.mock('path', () => ({
  ...jest.requireActual('path'), // Import and retain default behavior
  resolve: jest.fn((...args) => {
    // Simulate path.resolve behavior for the specific use case in webpack.config
    if (args[0] === '__dirname' && args[1] === '../../dist') {
      return '/mock/project/root/dist';
    }
    if (args[0] === '__dirname' && args[1] === '../../src') {
      return '/mock/project/root/src';
    }
    // Fallback for other path.resolve calls if any
    return jest.requireActual('path').resolve(...args);
  }),
}));

describe('webpackConfig', () => {
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Development Mode Configuration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      // Clear module cache to ensure fresh import with new NODE_ENV
      jest.resetModules();
      // Re-import the config after setting NODE_ENV
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const configModule = require('../webpack.config');
      Object.assign(webpackConfig, configModule.default);
    });

    it('should set mode to "development"', () => {
      expect(webpackConfig.mode).toBe('development');
    });

    it('should set devtool to "eval-source-map"', () => {
      expect(webpackConfig.devtool).toBe('eval-source-map');
    });

    it('should not minimize in development mode', () => {
      expect(webpackConfig.optimization?.minimize).toBe(false);
    });
  });

  describe('Production Mode Configuration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      // Clear module cache to ensure fresh import with new NODE_ENV
      jest.resetModules();
      // Re-import the config after setting NODE_ENV
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const configModule = require('../webpack.config');
      Object.assign(webpackConfig, configModule.default);
    });

    it('should set mode to "production"', () => {
      expect(webpackConfig.mode).toBe('production');
    });

    it('should set devtool to "source-map"', () => {
      expect(webpackConfig.devtool).toBe('source-map');
    });

    it('should minimize in production mode', () => {
      expect(webpackConfig.optimization?.minimize).toBe(true);
    });
  });

  describe('Common Configuration', () => {
    beforeEach(() => {
      // Ensure a consistent environment for common tests
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const configModule = require('../webpack.config');
      Object.assign(webpackConfig, configModule.default);
    });

    it('should have a single entry point', () => {
      expect(webpackConfig.entry).toBe('./src/index.ts');
    });

    describe('Output Configuration', () => {
      it('should resolve output path correctly', () => {
        expect(webpackConfig.output?.path).toBe('/mock/project/root/dist');
        expect(path.resolve).toHaveBeenCalledWith('__dirname', '../../dist');
      });

      it('should define filename with contenthash', () => {
        expect(webpackConfig.output?.filename).toBe('[name].[contenthash].js');
      });

      it('should define chunkFilename with contenthash', () => {
        expect(webpackConfig.output?.chunkFilename).toBe('[name].[contenthash].chunk.js');
      });

      it('should set publicPath to "/"', () => {
        expect(webpackConfig.output?.publicPath).toBe('/');
      });

      it('should enable clean output directory', () => {
        expect(webpackConfig.output?.clean).toBe(true);
      });
    });

    describe('Resolve Configuration', () => {
      it('should include common extensions', () => {
        expect(webpackConfig.resolve?.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx', '.json']);
      });

      it('should have an empty alias object by default', () => {
        expect(webpackConfig.resolve?.alias).toEqual({});
      });
    });

    describe('Module Rules', () => {
      it('should have 4 rules defined', () => {
        expect(webpackConfig.module?.rules).toHaveLength(4);
      });

      it('should have a rule for TypeScript/JavaScript files', () => {
        const tsJsRule = webpackConfig.module?.rules[0] as Configuration['module']['rules'][0];
        expect(tsJsRule).toMatchObject({
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
            },
          },
        });
      });

      it('should have a rule for CSS files', () => {
        const cssRule = webpackConfig.module?.rules[1] as Configuration['module']['rules'][0];
        expect(cssRule).toMatchObject({
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        });
      });

      it('should have a rule for image files', () => {
        const imageRule = webpackConfig.module?.rules[2] as Configuration['module']['rules'][0];
        expect(imageRule).toMatchObject({
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[contenthash][ext]',
          },
        });
      });

      it('should have a rule for font files', () => {
        const fontRule = webpackConfig.module?.rules[3] as Configuration['module']['rules'][0];
        expect(fontRule).toMatchObject({
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[contenthash][ext]',
          },
        });
      });
    });

    it('should have an empty plugins array by default', () => {
      expect(webpackConfig.plugins).toEqual([]);
    });

    describe('Optimization Configuration', () => {
      it('should enable "all" chunks for splitChunks', () => {
        expect(webpackConfig.optimization?.splitChunks?.chunks).toBe('all');
      });

      it('should set minSize for splitChunks', () => {
        expect(webpackConfig.optimization?.splitChunks?.minSize).toBe(20000);
      });

      it('should set maxInitialRequests for splitChunks', () => {
        expect(webpackConfig.optimization?.splitChunks?.maxInitialRequests).toBe(30);
      });

      it('should set minChunks for splitChunks', () => {
        expect(webpackConfig.optimization?.splitChunks?.minChunks).toBe(1);
      });

      it('should define a custom name function for splitChunks', () => {
        expect(typeof webpackConfig.optimization?.splitChunks?.name).toBe('function');
        const nameFn = webpackConfig.optimization?.splitChunks?.name as Function;
        const mockModule = {};
        const mockChunks = [{ name: 'chunkA' }, { name: 'chunkB' }];
        const mockCacheGroupKey = 'myGroup';
        expect(nameFn(mockModule, mockChunks, mockCacheGroupKey)).toBe('myGroup~chunkA~chunkB');
      });

      describe('Cache Groups', () => {
        it('should define a "vendor" cache group', () => {
          const vendorGroup = webpackConfig.optimization?.splitChunks?.cacheGroups?.vendor;
          expect(vendorGroup).toMatchObject({
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
            enforce: true,
          });
        });

        it('should define a "common" cache group', () => {
          const commonGroup = webpackConfig.optimization?.splitChunks?.cacheGroups?.common;
          expect(commonGroup).toMatchObject({
            minChunks: 2,
            name: 'common',
            priority: -20,
            reuseExistingChunk: true,
            enforce: true,
          });
        });

        it('should define a "default" cache group', () => {
          const defaultGroup = webpackConfig.optimization?.splitChunks?.cacheGroups?.default;
          expect(defaultGroup).toMatchObject({
            minChunks: 2,
            priority: -30,
            reuseExistingChunk: true,
          });
        });
      });

      it('should enable single runtimeChunk', () => {
        expect(webpackConfig.optimization?.runtimeChunk).toBe('single');
      });
    });
  });
});