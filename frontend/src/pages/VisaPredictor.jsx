import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VisaPredictor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    continent: "Asia",
    education_of_employee: "Master's",
    has_job_experience: "Y",
    requires_job_training: "N",
    no_of_employees: 500,
    yr_of_estab: 2000,
    region_of_employment: "Northeast",
    prevailing_wage: 80000,
    unit_of_wage: "Year",
    full_time_position: "Y",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/visa/predict", {
        ...form,
        no_of_employees: parseInt(form.no_of_employees),
        yr_of_estab: parseInt(form.yr_of_estab),
        prevailing_wage: parseFloat(form.prevailing_wage),
      });
      setResult(response.data);
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const SelectField = ({ label, name, options }) => (
    <div>
      <label className="text-gray-600 text-sm mb-1 block">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full border border-gray-200 bg-white text-gray-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const InputField = ({ label, name, type = "text" }) => (
    <div>
      <label className="text-gray-600 text-sm mb-1 block">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full border border-gray-200 bg-white text-gray-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-300 text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-blue-500 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-500 font-bold text-sm">CP</span>
          </div>
          <span className="text-white font-bold text-lg">clearpath.ai</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Chat button */}

          <div className="relative group">
            <button
              onClick={() => navigate("/chat")}
              className="text-white hover:bg-blue-400 p-2 rounded-lg transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <span className="absolute top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
              Chat
            </span>
          </div>

          {/* Logout button */}
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="text-white hover:bg-blue-400 p-2 rounded-lg transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <span className="absolute top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
              Logout
            </span>
          </div>

          {/* Email - rightmost */}
          <span className="text-white text-sm">{localStorage.getItem("email")}</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Visa Approval Predictor</h2>
        <p className="text-gray-400 text-sm mb-6">Fill in the details to predict your visa approval chances.</p>

        {/* Side by side layout */}
        <div className="flex gap-6">

          {/* Left - Form */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Continent" name="continent" options={["Asia", "Africa", "Europe", "North America", "South America", "Oceania"]} />
                <SelectField label="Education Level" name="education_of_employee" options={["High School", "Bachelor's", "Master's", "Doctorate"]} />
                <SelectField label="Has Job Experience" name="has_job_experience" options={["Y", "N"]} />
                <SelectField label="Requires Job Training" name="requires_job_training" options={["Y", "N"]} />
                <InputField label="Number of Employees" name="no_of_employees" type="number" />
                <InputField label="Year Established" name="yr_of_estab" type="number" />
                <SelectField label="Region of Employment" name="region_of_employment" options={["Northeast", "South", "West", "Midwest", "Island"]} />
                <InputField label="Prevailing Wage" name="prevailing_wage" type="number" />
                <SelectField label="Unit of Wage" name="unit_of_wage" options={["Year", "Hour", "Week", "Month"]} />
                <SelectField label="Full Time Position" name="full_time_position" options={["Y", "N"]} />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 text-sm"
              >
                {loading ? "Predicting..." : "Predict Visa Approval"}
              </button>
            </form>
          </div>

          {/* Right - Result */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Fill the form and click predict to see your results here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Prediction */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">Prediction</p>
                  <p className={`text-4xl font-bold ${result.prediction === "Certified" ? "text-green-500" : "text-red-500"}`}>
                    {result.prediction}
                  </p>
                </div>

                {/* Confidence */}
                <div>
                  <p className="text-gray-500 text-sm mb-2">Confidence</p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-green-500 font-bold text-lg">{(result.confidence.Certified * 100).toFixed(1)}%</p>
                      <p className="text-gray-400 text-xs">Certified</p>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <p className="text-red-500 font-bold text-lg">{(result.confidence.Denied * 100).toFixed(1)}%</p>
                      <p className="text-gray-400 text-xs">Denied</p>
                    </div>
                  </div>
                </div>

                {/* SHAP */}
                <div>
                  <p className="text-gray-500 text-sm mb-2">Why this prediction? (SHAP)</p>
                  <div className="space-y-1.5">
                    {Object.entries(result.shap_explanation).map(([feature, value]) => (
                      <div key={feature} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-600 text-xs">{feature}</span>
                        <span className={`text-xs font-semibold ${value > 0 ? "text-green-500" : "text-red-500"}`}>
                          {value > 0 ? "+" : ""}{value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Positive = pushes toward Certified. Negative = pushes toward Denied.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaPredictor;