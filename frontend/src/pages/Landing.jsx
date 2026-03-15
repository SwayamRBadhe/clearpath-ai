import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-blue-500 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-500 font-bold text-sm">CP</span>
          </div>
          <span className="text-white font-bold text-xl">clearpath.ai</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/auth")}
            className="text-white border border-white px-4 py-2 rounded-lg text-sm hover:bg-blue-400 transition duration-200"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <span className="text-white font-bold text-3xl">CP</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Navigate US Immigration <br />
          <span className="text-blue-500">with Confidence</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-8">
          ClearPath AI helps international students understand visas, OPT, STEM OPT,
          and predict visa approval — powered by AI and official USCIS documents.
        </p>

        <button
          onClick={() => navigate("/auth")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition duration-200 shadow-md"
        >
          Get Started — It's Free
        </button>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto w-full px-6 pb-16 grid grid-cols-2 gap-6">

        {/* Card 1 - Chat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">AI Immigration Assistant</h3>
          <p className="text-gray-400 text-sm">
            Ask any question about F-1 visas, OPT, STEM OPT, and immigration forms.
            Powered by official USCIS documents.
          </p>
        </div>

        {/* Card 2 - Visa Predictor */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">Visa Approval Predictor</h3>
          <p className="text-gray-400 text-sm">
            Predict your visa approval chances using ML trained on 25,000+ real cases.
            Get SHAP-powered explanations for every prediction.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-gray-400 text-sm">
        © 2026 ClearPath AI · Built for international students by Swayam Badhe · Syracuse University MS CS
      </div>

    </div>
  );
};

export default Landing;