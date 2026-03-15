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

  // Helper to render a select field
  const SelectField = ({ label, name, options }) => (
    <div>
      <label className="text-gray-300 text-sm mb-1 block">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  // Helper to render an input field
  const InputField = ({ label, name, type = "text" }) => (
    <div>
      <label className="text-gray-300 text-sm mb-1 block">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <div className="bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-white font-bold text-xl">ClearPath AI</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="text-blue-400 hover:underline text-sm"
          >
            Chat
          </button>
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="text-red-400 hover:underline text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2">Visa Approval Predictor</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Fill in the details below to predict your visa approval chances.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            label="Continent"
            name="continent"
            options={["Asia", "Africa", "Europe", "North America", "South America", "Oceania"]}
          />
          <SelectField
            label="Education Level"
            name="education_of_employee"
            options={["High School", "Bachelor's", "Master's", "Doctorate"]}
          />
          <SelectField
            label="Has Job Experience"
            name="has_job_experience"
            options={["Y", "N"]}
          />
          <SelectField
            label="Requires Job Training"
            name="requires_job_training"
            options={["Y", "N"]}
          />
          <InputField label="Number of Employees" name="no_of_employees" type="number" />
          <InputField label="Year Company Established" name="yr_of_estab" type="number" />
          <SelectField
            label="Region of Employment"
            name="region_of_employment"
            options={["Northeast", "South", "West", "Midwest", "Island"]}
          />
          <InputField label="Prevailing Wage" name="prevailing_wage" type="number" />
          <SelectField
            label="Unit of Wage"
            name="unit_of_wage"
            options={["Year", "Hour", "Week", "Month"]}
          />
          <SelectField
            label="Full Time Position"
            name="full_time_position"
            options={["Y", "N"]}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {loading ? "Predicting..." : "Predict Visa Approval"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 bg-gray-900 rounded-2xl p-6 space-y-4">
            {/* Prediction */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Prediction</p>
              <p className={`text-3xl font-bold ${result.prediction === "Certified" ? "text-green-400" : "text-red-400"}`}>
                {result.prediction}
              </p>
            </div>

            {/* Confidence */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Confidence</p>
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-green-400 font-bold text-lg">{(result.confidence.Certified * 100).toFixed(1)}%</p>
                  <p className="text-gray-400 text-xs">Certified</p>
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-red-400 font-bold text-lg">{(result.confidence.Denied * 100).toFixed(1)}%</p>
                  <p className="text-gray-400 text-xs">Denied</p>
                </div>
              </div>
            </div>

            {/* SHAP Explanation */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Why this prediction? (SHAP)</p>
              <div className="space-y-2">
                {Object.entries(result.shap_explanation).map(([feature, value]) => (
                  <div key={feature} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
                    <span className="text-gray-300 text-sm">{feature}</span>
                    <span className={`text-sm font-semibold ${value > 0 ? "text-green-400" : "text-red-400"}`}>
                      {value > 0 ? "+" : ""}{value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Positive values push toward Certified, negative toward Denied.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaPredictor;