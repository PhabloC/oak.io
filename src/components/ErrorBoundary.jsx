import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Algo deu errado
            </h1>
            <p className="text-gray-400 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg shadow-indigo-500/30"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
