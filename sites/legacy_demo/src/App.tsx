import ColorPickerComponent from './ColorPickerComponent';
import ColorPickerReact from './ColorPickerReact';
import ColorMapComponent from './ColorMapComponent';
import ColorMapReact from './ColorMapReact';

function App() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto flex flex-col  text-base-content">
      {/* Header */}
      <header className="navbar shadow-md">
        <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Color Mapping Editor Legacy Test</h1>
          <p className="text-sm mt-1">
            Testing of forked library{' '}
            <a
              href="https://dlr-sc.github.io/transfer-function-editor/"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-medium"
            >
              core components functionality
            </a>
            .
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex grow flex-col items-center justify-center p-6">
        {/* Color Map React */}
        <div className="w-full bg-base-100 rounded-xl shadow-xl border border-base-300 relative p-6 m-5">
          <div className="absolute -top-3 left-4 bg-base-100 px-3 text-sm font-semibold text-secondary border border-base-300 rounded-md">
            Color Map React
          </div>
          <div className="mt-2">
            <ColorMapReact />
          </div>
        </div>

        {/* Color Picker React*/}
        <div className="w-full bg-base-100 rounded-xl shadow-xl border border-base-300 relative p-6 m-5">
          {/* Panel Label */}
          <div className="absolute -top-3 left-4 bg-base-100 px-3 text-sm font-semibold text-secondary border border-base-300 rounded-md">
            Color Picker React
          </div>
          {/* Inner Content */}
          <div className="mt-2">
            <ColorPickerReact />
          </div>
        </div>

        {/* Color Map Legacy*/}
        <div className="w-full bg-base-100 rounded-xl shadow-xl border border-base-300 relative p-6 m-5">
          <div className="absolute -top-3 left-4 bg-base-100 px-3 text-sm font-semibold text-secondary border border-base-300 rounded-md">
            Color Map Legacy
          </div>
          <div className="mt-2">
            <ColorMapComponent />
          </div>
        </div>

        {/* Color Picker Legacy*/}
        <div className="w-full bg-base-100 rounded-xl shadow-xl border border-base-300 relative p-6 m-5">
          <div className="absolute -top-3 left-4 bg-base-100 px-3 text-sm font-semibold text-secondary border border-base-300 rounded-md">
            Color Picker Legacy
          </div>
          {/* Inner Content */}
          <div className="mt-2">
            <ColorPickerComponent />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center bg-base-300 text-base-content p-4">
        <div>
          <p>
            <a
              href="https://github.com/kulvait/ColorMappingEditor"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-medium"
            >
              GitHub Project
            </a>{' '}
            • Created with <span className="font-semibold">React</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
