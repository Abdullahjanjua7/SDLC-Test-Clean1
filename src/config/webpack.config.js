import type { Configuration } from 'webpack';
import path from 'path';
// You might need to import specific plugins if you use them, e.g.:
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// import TerserPlugin from 'terser-webpack-plugin';

/**
 * Webpack configuration for potential adjustments, especially for code splitting.
 * This configuration is designed for a custom setup, not relying on Create React App defaults.
 *
 * Best practices:
 * - Use `process.env.NODE_ENV` to differentiate between development and production.
 * - Use `[contenthash]` for cache busting in production.
 * - Implement robust code splitting for optimized bundle sizes and loading performance.
 * - Clean the output directory before each build.
 * - Use asset modules for handling static assets (images, fonts).
 */
const webpackConfig: Configuration = {
  // Define the mode for Webpack.
  // 'production' enables tree-shaking, minification, and other optimizations.
  // 'development' enables useful tools for debugging and faster builds.
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // The entry point(s) for the application.
  // For a single entry point: './src/index.ts'
  // For multiple entry points: { app: './src/index.ts', admin: './src/admin.ts' }
  entry: './src/index.ts',

  // Output configuration for the bundled files.
  output: {
    // The output directory for the bundles.
    // Assumes 'dist' is in the project root, relative to this config file.
    path: path.resolve(__dirname, '../../dist'),
    // The filename pattern for the main bundle.
    // `[name]` is replaced by the chunk name (e.g., 'main').
    // `[contenthash]` adds a hash based on the content, useful for cache busting.
    filename: '[name].[contenthash].js',
    // The filename pattern for non-entry chunks (e.g., those created by code splitting).
    chunkFilename: '[name].[contenthash].chunk.js',
    // Public path for assets. Useful when assets are served from a CDN or different path.
    publicPath: '/',
    // Clean the output directory before emit.
    clean: true,
  },

  // Module resolution configuration.
  resolve: {
    // Extensions to resolve. This allows importing modules without specifying their extensions.
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    // Aliases for modules. Useful for shortening import paths.
    alias: {
      // Example: '@': path.resolve(__dirname, '../../src'),
      // This allows imports like `import MyComponent from '@/components/MyComponent';`
    },
  },

  // Rules for how different types of modules are treated.
  module: {
    rules: [
      // Rule for TypeScript/JavaScript files.
      // Uses babel-loader for transpilation, supporting TypeScript and modern JS features.
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Transpiles modern JavaScript to be compatible with target environments.
              '@babel/preset-typescript', // Handles TypeScript syntax.
              // If using React, uncomment the following:
              // '@babel/preset-react', // Handles React JSX syntax.
            ],
            // Add plugins for specific features if needed, e.g., dynamic import syntax.
            // plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      // Rule for CSS files.
      // 'style-loader' injects CSS into the DOM.
      // 'css-loader' interprets `@import` and `url()` like `import/require()` and resolves them.
      // 'postcss-loader' processes CSS with PostCSS plugins (e.g., Autoprefixer, TailwindCSS).
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Rule for image files.
      // Webpack 5's built-in asset modules handle various asset types.
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource', // Emits a separate file and exports the URL.
        generator: {
          filename: 'assets/images/[name].[contenthash][ext]', // Output path for images.
        },
      },
      // Rule for font files.
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash][ext]', // Output path for fonts.
        },
      },
    ],
  },

  // Plugins to extend Webpack's capabilities.
  plugins: [
    // Example: HtmlWebpackPlugin generates an HTML file and injects bundles.
    // new HtmlWebpackPlugin({
    //   template: './public/index.html', // Path to your HTML template.
    //   filename: 'index.html', // Output HTML file name.
    // }),
    // Example: DefinePlugin allows creating global constants.
    // new webpack.DefinePlugin({
    //   'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api'),
    // }),
    // If using MiniCssExtractPlugin for production CSS extraction:
    // new MiniCssExtractPlugin({
    //   filename: '[name].[contenthash].css',
    //   chunkFilename: '[id].[contenthash].css',
    // }),
  ],

  // Optimization settings, crucial for performance and code splitting.
  optimization: {
    // Minimize the output bundles in production mode.
    minimize: process.env.NODE_ENV === 'production',
    // Custom minimizers for JavaScript and CSS.
    // In production, Webpack's default minimizer (TerserPlugin) is used for JS.
    // For CSS, you might need CssMinimizerPlugin.
    // minimizer: [
    //   new TerserPlugin({
    //     terserOptions: {
    //       compress: {
    //         // Drop console logs in production builds.
    //         drop_console: process.env.NODE_ENV === 'production',
    //       },
    //     },
    //   }),
    //   // If using MiniCssExtractPlugin, uncomment CssMinimizerPlugin:
    //   // new CssMinimizerPlugin(),
    // ],

    // Code splitting configuration using SplitChunksPlugin.
    splitChunks: {
      // Determines which chunks are selected for optimization.
      // 'all' means both dynamic and non-dynamic imports are considered for splitting.
      chunks: 'all',

      // Minimum size of a chunk to be considered for splitting (in bytes).
      minSize: 20000, // 20KB

      // Maximum number of parallel requests for an entry point.
      maxInitialRequests: 30,

      // Minimum number of chunks that a module must be shared between before splitting.
      minChunks: 1,

      // Custom naming function for generated chunks.
      // If `true`, Webpack automatically generates names.
      // name: true, // A simpler option for automatic naming.
      name: (module, chunks, cacheGroupKey) => {
        const allChunksNames = chunks.map((chunk) => chunk.name).join('~');
        return `${cacheGroupKey}~${allChunksNames}`;
      },

      // Cache groups allow you to group modules based on specific criteria.
      cacheGroups: {
        // Vendor chunk: modules from node_modules.
        // This separates third-party libraries into their own chunk for better caching.
        vendor: {
          test: /[\\/]node_modules[\\/]/, // Regex to match modules in node_modules.
          name: 'vendors', // Name of the vendor chunk.
          priority: -10, // Higher priority means this group is processed before others.
          reuseExistingChunk: true, // Reuse existing chunks if possible.
          enforce: true, // Enforce this cache group even if it doesn't meet minSize/minChunks.
        },
        // Common application code: modules used in multiple entry points/chunks.
        // This helps extract shared code that isn't from node_modules.
        common: {
          minChunks: 2, // Module must be shared between at least 2 chunks.
          name: 'common', // Name of the common chunk.
          priority: -20, // Lower priority than vendor.
          reuseExistingChunk: true,
          enforce: true,
        },
        // Default cache group for modules that don't fit into other groups.
        // This is Webpack's default behavior, often good to keep.
        default: {
          minChunks: 2, // Modules used in at least 2 chunks.
          priority: -30,
          reuseExistingChunk: true,
        },
      },
    },
    // Runtime chunk: extract the webpack runtime code into a separate chunk.
    // This helps with long-term caching of vendor and application code, as changes
    // to your app code won't invalidate the runtime or vendor chunks.
    runtimeChunk: 'single',
  },

  // Source map configuration for debugging.
  // 'source-map' for production (detailed, separate file).
  // 'eval-source-map' for development (faster, embedded).
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',

  // Development server configuration (typically used in development mode).
  // This section is often in a separate `webpack.dev.ts` file or handled by a tool like `webpack-dev-server`.
  // devServer: {
  //   static: {
  //     directory: path.join(__dirname, '../../public'), // Serve static files from 'public'
  //   },
  //   compress: true, // Enable gzip compression.
  //   port: 3000, // Port to run the dev server on.
  //   open: true, // Open the browser after server starts.
  //   hot: true, // Enable Hot Module Replacement (HMR).
  //   historyApiFallback: true, // For single-page applications, serves index.html for 404s.
  // },
};

export default webpackConfig;