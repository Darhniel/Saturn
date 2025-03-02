'use client'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

// ===================================================================
// TYPES
// ===================================================================

type FormData = {
  // For individuals
  fullName?: string;
  email?: string;
  // For businesss
  businessName?: string;
  businessEmail?: string;
  password: string;
  confirmPassword: string;
  // Step 2 fields (same for both flows)
  dob: string;
  address: string;
  investment: string;
  portfolioType: string[];
  // Account type
  userType: "individual" | "business";
  // Step 3 (only for personal flow)
  investmentAmount: string;
  investmentType: string;
  investmentDuration: string;
  // Step 4 (only for personal flow)
  bankName: string;
  accountNumber: string;
  // Step 5 fields
  files: File[];
};

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export default function Home() {
  // For navigation we keep an array of steps.
  // For individuals the steps are [1,2,3,4,5]
  // For businesss the flow is [1,2,5]
  const [stepOrder, setStepOrder] = useState<number[]>([1, 2, 3, 4, 5]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = stepOrder[currentStepIndex];
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    businessName: "",
    businessEmail: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    investment: "",
    portfolioType: [],
    userType: "individual",
    investmentAmount: "",
    investmentType: "",
    investmentDuration: "",
    bankName: "",
    accountNumber: "",
    files: []
  });

  const [success, setSuccess] = useState(false);

  // This function is called when the user clicks Next on any step.
  // It merges the step’s data into formData and then advances.
  const handleNext = (stepData: Partial<FormData>) => {
    // Merge in new data
    setFormData(prev => ({ ...prev, ...stepData }));

    // If we are on Step One then update the flow based on account type.
    // For business, we skip steps 3 and 4.
    if (currentStep === 1) {
      if (stepData.userType === "business") {
        setStepOrder([1, 2, 5]);
      } else {
        setStepOrder([1, 2, 3, 4, 5]);
      }
    }
    // If we’re at the final step, submit; otherwise advance.
    if (currentStepIndex === stepOrder.length - 1) {
      handleSubmitAll({ ...formData, ...stepData });
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Go back one step.
  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Called when a progress bar step is clicked.
  // Only allow going back.
  const goToStep = (index: number) => {
    if (index < currentStepIndex) {
      setCurrentStepIndex(index);
    }
  };

  async function handleSubmitAll(finalData: FormData) {
    setLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch("https://saturndigitalbackend.onrender.com/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Submission successful:", result);
      setSuccess(true);
      alert("Submission Successful")
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("Submission timed out.");
          alert("Submission timed out. Please try again.");
        } else {
          console.error("Error submitting data:", error.message);
          alert("Submission failed. Please try again.");
        }
      } else {
        console.error("Unexpected error", error);
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the proper step based on the current step value.
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne data={formData} onNext={handleNext} />;
      case 2:
        return <StepTwo data={formData} onNext={handleNext} />;
      case 3:
        return <StepThree data={formData} onNext={handleNext} />;
      case 4:
        return <StepFour data={formData} onNext={handleNext} />;
      case 5:
        return <StepFive data={formData} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#7A23E8] py-4">
      <div className="absolute bottom-20 left-0 w-40 h-40">
        <Image
          src="/bg-left.svg"
          alt="Background Left"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="absolute top-0 right-0 w-40 h-40">
        <Image
          src="/bg-right.svg"
          alt="Background Right"
          layout="fill"
          objectFit="contain"
        />
      </div>

      {<div className="flex flex-col items-center justify-center min-h-screen px-4">
        {loading ? (
          <div className="mb-4">
            <Spinner />
          </div>
        ) : success ? (
          <Success />
        ) : (
          <>
            <div className="my-8">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={144}
                height={80}
              />
            </div>

            <h1 className="text-white text-[2rem] text-center font-bold mb-2">
              Account Creation & KYC
            </h1>

            <ProgressBar stepOrder={stepOrder} currentStepIndex={currentStepIndex} goToStep={goToStep} />

            {renderStep()}

            {currentStepIndex > 0 && (
              <button onClick={goBack} className="w-full text-white py-2 rounded-md font-medium">
                ← Back
              </button>
            )}
          </>
        )}
      </div>}
    </div>
  );
}

// ===================================================================
// PROGRESS BAR COMPONENT
// ===================================================================

type ProgressBarProps = {
  stepOrder: number[];
  currentStepIndex: number;
  goToStep: (index: number) => void;
};

function ProgressBar({ stepOrder, currentStepIndex, goToStep }: ProgressBarProps) {
  return (
    <div className="flex space-x-2 mb-8 w-full max-w-[31rem] mx-auto">
      {stepOrder.map((step, index) => (
        <div
          key={step}
          // Only allow clicking on previous steps
          className={`flex-1 h-2 rounded-2xl ${index <= currentStepIndex ? "bg-white cursor-pointer" : "bg-white/50"}`}
          onClick={() => {
            if (index < currentStepIndex) goToStep(index);
          }}
        />
      ))}
    </div>
  );
}

// ===================================================================
// SUCCESS COMPONENT
// ===================================================================

function Success() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-9 max-w-[35rem] w-full mx-auto text-center border-2">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2 text-gray-800">Account Successfully Created</h2>
      <p className="text-gray-500 mb-10">
        Your account has been successfully created! Get started by setting up your profile and verifying your details.
      </p>
      <div className="flex justify-center space-x-4">
        <button type="button" className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50" onClick={() => window.location.reload()}>
          Cancel
        </button>
        <button type="button" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700" onClick={() => window.location.reload()}>
          Make Payment
        </button>
      </div>
    </div>
  );
}

// ====================================================================
// SPINNER COMPONENT
// ==================================================================== 

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <svg
        className="animate-spin h-20 w-20 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>
  );
};


//  ===================================================================
// STEP ONE COMPONENT
// ===================================================================

type StepOneProps = {
  data: FormData;
  onNext: (data: Partial<FormData>) => void;
};

function StepOne({ data, onNext }: StepOneProps) {
  // Local state includes separate fields for personal vs. business.
  interface LocalData {
    fullName: string;
    businessName: string;
    email: string;
    businessEmail: string;
    password: string;
    confirmPassword: string;
    userType: "individual" | "business";
  }
  const [localData, setLocalData] = useState<LocalData>({
    fullName: data.fullName || "",
    businessName: data.businessName || "",
    email: data.email || "",
    businessEmail: data.businessEmail || "",
    password: data.password || "",
    confirmPassword: data.confirmPassword || "",
    userType: data.userType || "individual"
  });

  const [errors, setErrors] = useState({
    nameError: false,
    emailError: false,
    passwordError: false,
    confirmPasswordError: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false,
    hasNumber: false,
    isLongEnough: false
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    return {
      isValid: hasUppercase && hasLowercase && hasSpecialChar && hasNumber && isLongEnough,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
      hasNumber,
      isLongEnough
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newLocalData = { ...localData, [name]: value };

    // Validate the name field (fullName or businessName)
    if (name === "fullName" || name === "businessName") {
      if (value.trim() === "" || /\d/.test(value)) {
        setErrors(prev => ({ ...prev, nameError: true }));
      } else {
        setErrors(prev => ({ ...prev, nameError: false }));
      }
    }
    // Validate the email field (email or businessEmail)
    if (name === "email" || name === "businessEmail") {
      if (value.trim() === "" || !/^\S+@\S+\.\S+$/.test(value)) {
        setErrors(prev => ({ ...prev, emailError: true }));
      } else {
        setErrors(prev => ({ ...prev, emailError: false }));
      }
    }
    // Validate password
    if (name === "password") {
      const { isValid, hasUppercase, hasLowercase, hasSpecialChar, hasNumber, isLongEnough } = validatePassword(value);
      setErrors(prev => ({ ...prev, passwordError: !isValid }));
      setValidation({ hasUppercase, hasLowercase, hasSpecialChar, hasNumber, isLongEnough });
    }
    // Validate confirmPassword match
    if (name === "confirmPassword" || name === "password") {
      const isMatching = newLocalData.password === newLocalData.confirmPassword;
      setErrors(prev => ({ ...prev, confirmPasswordError: !isMatching }));
    }
    setLocalData(newLocalData);
  };

  function complete() {
    let nameValid = false;
    let emailValid = false;
    if (localData.userType === "individual") {
      nameValid = localData.fullName.trim() !== "";
      emailValid = localData.email.trim() !== "";
    } else {
      nameValid = localData.businessName.trim() !== "";
      emailValid = localData.businessEmail.trim() !== "";
    }
    if (
      errors.nameError ||
      errors.emailError ||
      errors.passwordError ||
      errors.confirmPasswordError ||
      !nameValid ||
      !emailValid ||
      localData.password === "" ||
      localData.confirmPassword === ""
    ) {
      // alert("Please fill out all required fields correctly.");
      return true;
    }

    return false;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure the proper fields are filled in based on account type.
    let nameValid = false;
    let emailValid = false;
    if (localData.userType === "individual") {
      nameValid = localData.fullName.trim() !== "";
      emailValid = localData.email.trim() !== "";
    } else {
      nameValid = localData.businessName.trim() !== "";
      emailValid = localData.businessEmail.trim() !== "";
    }
    if (
      errors.nameError ||
      errors.emailError ||
      errors.passwordError ||
      errors.confirmPasswordError ||
      !nameValid ||
      !emailValid ||
      localData.password === "" ||
      localData.confirmPassword === ""
    ) {
      alert("Please fill out all required fields correctly.");
      return;
    }
    // Pass data upward—use different keys based on account type.
    if (localData.userType === "individual") {
      onNext({
        fullName: localData.fullName,
        email: localData.email,
        password: localData.password,
        confirmPassword: localData.confirmPassword,
        userType: localData.userType
      });
    } else {
      onNext({
        businessName: localData.businessName,
        businessEmail: localData.businessEmail,
        password: localData.password,
        confirmPassword: localData.confirmPassword,
        userType: localData.userType
      });
    }
  };

  return (
    <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Account Registration
      </h2>
      <p className="text-sm text-[#8C8B90] mb-6">
        Sign up to get started on your Saturn journey. Fill in your details to begin.
      </p>
      <form onSubmit={handleSubmit}>
        {/* Account Type Selection */}
        <div className="mb-4 flex gap-12">
          <label className={`w-full cursor-pointer p-6 border rounded-xl ${localData.userType === 'individual' ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#EBEBEB]"}`}>
            <div className="relative">
              <input
                type="radio"
                name="userType"
                value="individual"
                className="block w-5 h-5 mb-3 appearance-none peer opacity-0 cursor-pointer"
                checked={localData.userType === 'individual'}
                onChange={handleChange}
              />
              <div className="absolute w-5 h-5 border rounded-full border-[#D0D5DD] top-1 peer-checked:border-purple-600 transition-all"></div>
              <div className="peer-checked:bg-purple-600 peer-checked:block w-3 h-3 rounded-full top-2 left-1 absolute"></div>
            </div>
            <span className={`text-base ${localData.userType === 'individual' ? 'font-semibold text-purple-600' : 'text-gray-800'}`}>
              individual
            </span>
          </label>

          <label className={`w-full cursor-pointer p-6 border rounded-xl ${localData.userType === 'business' ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
            <div className="relative">
              <input
                type="radio"
                name="userType"
                value="business"
                className="block w-5 h-5 mb-3 appearance-none peer opacity-0 cursor-pointer"
                checked={localData.userType === 'business'}
                onChange={handleChange}
              />
              <div className="absolute w-5 h-5 border rounded-full border-gray-400 top-1 peer-checked:border-purple-600 transition-all"></div>
              <div className="peer-checked:bg-purple-600 peer-checked:block w-3 h-3 rounded-full top-2 left-1 absolute"></div>
            </div>
            <span className={`text-base ${localData.userType === 'business' ? 'font-semibold text-purple-600' : 'text-gray-800'}`}>
              business
            </span>
          </label>
        </div>
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-base font-medium text-gray-800 mb-2">
            {localData.userType === "individual" ? "Full Name" : "Business Name"}
          </label>
          <input
            type="text"
            name={localData.userType === "individual" ? "fullName" : "businessName"}
            placeholder={localData.userType === "individual" ? "Enter Full Name" : "Enter Business Name"}
            className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            value={localData.userType === "individual" ? localData.fullName : localData.businessName}
            onChange={handleChange}
          />
          {errors.nameError && (
            <div className="flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-red-600 font-medium">
                Please enter a valid name.
              </span>
            </div>
          )}
        </div>
        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-base font-medium text-gray-800 mb-2">
            {localData.userType === "individual" ? "Email Address" : "Business Email"}
          </label>
          <input
            type="email"
            name={localData.userType === "individual" ? "email" : "businessEmail"}
            placeholder={localData.userType === "individual" ? "Enter Email Address" : "Enter Business Email"}
            className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            value={localData.userType === "individual" ? localData.email : localData.businessEmail}
            onChange={handleChange}
          />
          {errors.emailError && (
            <div className="flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-red-600 font-medium">
                Please enter a valid email.
              </span>
            </div>
          )}
        </div>
        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-base font-medium text-gray-800 mb-2">Create Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter Password"
              className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              value={localData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[45%] -translate-y-1/2"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.passwordError && (
            <div className="flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-red-600 font-medium">
                Password must meet criteria.
              </span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.isLongEnough ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
              <span className={`text-sm ${validation.isLongEnough ? 'text-purple-600' : 'text-gray-500'}`}>8 characters</span>
              <Check size={16} color={validation.isLongEnough ? '#7e3af2' : '#999'} />
            </div>
            <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasUppercase ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
              <span className={`text-sm ${validation.hasUppercase ? 'text-purple-600' : 'text-gray-500'}`}>Uppercase</span>
              <Check size={16} color={validation.hasUppercase ? '#7e3af2' : '#999'} />
            </div>
            <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasLowercase ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
              <span className={`text-sm ${validation.hasLowercase ? 'text-purple-600' : 'text-gray-500'}`}>Lowercase</span>
              <Check size={16} color={validation.hasLowercase ? '#7e3af2' : '#999'} />
            </div>
            <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasSpecialChar ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
              <span className={`text-sm ${validation.hasSpecialChar ? 'text-purple-600' : 'text-gray-500'}`}>Special Char</span>
              <Check size={16} color={validation.hasSpecialChar ? '#7e3af2' : '#999'} />
            </div>
            <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasNumber ? "border-purple-600 bg-purple-100" : "border-gray-300"}`}>
              <span className={`text-sm ${validation.hasNumber ? 'text-purple-600' : 'text-gray-500'}`}>Number</span>
              <Check size={16} color={validation.hasNumber ? '#7e3af2' : '#999'} />
            </div>
          </div>
        </div>
        {/* Confirm Password Field */}
        <div className="mb-4">
          <label className="block text-base font-medium text-gray-800 mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            value={localData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPasswordError && (
            <div className="flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-red-600 font-medium">Passwords do not match.</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          className={`w-full text-white py-2 rounded transition-colors ${complete() ? "bg-[#D9D9D9]" : "bg-[#8627FF]"} `}
          disabled={complete()}
        >
          Proceed
        </button>
      </form>
    </div>
  );
}

// ===================================================================
// STEP TWO COMPONENT (common to both flows)
// ===================================================================

type StepTwoProps = {
  data: FormData;
  onNext: (data: Partial<FormData>) => void;
};

function StepTwo({ data, onNext }: StepTwoProps) {
  const today = new Date();
  const preciseEighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

  const [startDate, setStartDate] = useState<Date | null>(null);

  const [localData, setLocalData] = useState({
    dob: data.dob,
    address: data.address,
    investment: data.investment,
    portfolioType: data.portfolioType,
  });

  const [errors, setErrors] = useState({
    dateError: false,
    addressError: false,
    investmentError: false,
    portfolioError: false
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "portfolioType") {
      // Ignore the default option
      if (value !== "" && !localData.portfolioType.includes(value)) {
        setLocalData((prev) => ({
          ...prev,
          portfolioType: [...prev.portfolioType, value],
        }));

        // Optionally, clear any error for portfolio type:
        setErrors((prev) => ({ ...prev, portfolioError: false }));
      }
      return; // Exit early since we've handled portfolioType
    }

    const newLocalData = {
      ...localData,
      [name]: value,
    };

    // Validate address
    if (name === 'address') {
      if (value === "") {
        setErrors(prev => ({ ...prev, addressError: true }));
      } else {
        setErrors(prev => ({ ...prev, addressError: false }));
      }
    }

    // Validate investment
    if (name === 'investment') {
      if (value === "") {
        setErrors(prev => ({ ...prev, investmentError: true }))
      } else {
        setErrors(prev => ({ ...prev, investmentError: false }))
      }
    }

    setLocalData(newLocalData);
  };

  function complete() {
    if (errors.dateError || errors.addressError || errors.investmentError || errors.portfolioError || localData.dob === "" || localData.address === "" || localData.investment === "" || localData.portfolioType.length === 0) {
      return true;
    }

    return false;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(localData);
  };
  return (
    <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 p-9 mx-auto border-[#D2AEFF]">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Profile Setup
      </h2>
      <p className="text-sm text-[#8C8B90] mb-6">
        Set up your profile to tailor your experience and access all features seamlessly.
      </p>
      <form action="" onSubmit={handleSubmit}>
        {/* Date of Birth */}
        <div className='w-full mb-4'>
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="date">
            Date of Birth
          </label>
          <DatePicker
            className="w-full border border-[#D9D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 text-[#1F1E22]"
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              setLocalData((prev) => ({
                ...prev,
                dob: date ? date.toLocaleDateString() : "",
              }))
            }}
            maxDate={preciseEighteenYearsAgo}
            placeholderText="Select Date"
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            toggleCalendarOnIconClick
            closeOnScroll={true}
            customInput={
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 absolute left-3 text-gray-400" />
                <input
                  className="pl-10 pr-3 py-2 w-full"
                  placeholder="select date"
                  name='dob'
                  value={startDate ? startDate.toLocaleDateString() : ''}
                  onChange={(e) => e.preventDefault()}
                  onClick={(e) => (e.target as HTMLInputElement).blur()}
                />
              </div>
            }
          />
          {errors.dateError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please enter a valid date of birth
              </span>
            </div>
          }
        </div>

        {/* House Address */}
        <div className="mb-4">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            type="text"
            placeholder="Enter House Address"
            className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            name='address'
            value={localData.address}
            onChange={handleChange}
          />
          {errors.addressError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Address field cannot be empty
              </span>
            </div>
          }
        </div>

        {/* Investment */}
        <div className="mb-4">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="investment">
            Investment Appetite
          </label>
          <div className='flex gap-8 items-center mb-2'>
            <div className='flex items-center'>
              <div className="relative">
                <input
                  type="radio"
                  name="investment"
                  id="high"
                  value={"high"}
                  onChange={handleChange}
                  className="appearance-none peer w-5 h-5 opacity-0 relative z-10 cursor-pointer"
                />
                <div className="absolute w-5 h-5 border rounded-full border-[#D0D5DD] top-1 peer-checked:bg-[#8627ff] peer-checked:border-0 transition-all"></div>
                <svg className="absolute left-1 top-2 w-3 h-3 hidden peer-checked:block" viewBox="0 0 14 14" fill="none">
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="high" className="ml-2 text-base font-medium text-[#1F1E22]">High</label>
            </div>
            <div className='flex items-center'>
              <div className="relative">
                <input
                  type="radio"
                  name="investment"
                  id="medium"
                  value={"medium"}
                  onChange={handleChange}
                  className="appearance-none peer w-5 h-5 opacity-0 relative z-10 cursor-pointer"
                />
                <div className="absolute w-5 h-5 border rounded-full border-[#D0D5DD] top-1 peer-checked:bg-[#8627ff] peer-checked:border-0 transition-all"></div>
                <svg className="absolute left-1 top-2 w-3 h-3 hidden peer-checked:block" viewBox="0 0 14 14" fill="none">
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="medium" className="ml-2 text-base font-medium text-[#1F1E22]">Medium</label>
            </div>
            <div className='flex items-center'>
              <div className="relative">
                <input
                  type="radio"
                  name="investment"
                  id="low"
                  value={"low"}
                  onChange={handleChange}
                  className="appearance-none peer w-5 h-5 opacity-0 relative z-10 cursor-pointer"
                />
                <div className="absolute w-5 h-5 border rounded-full border-[#D0D5DD] top-1 peer-checked:bg-[#8627ff] peer-checked:border-0 transition-all"></div>
                <svg className="absolute left-1 top-2 w-3 h-3 hidden peer-checked:block" viewBox="0 0 14 14" fill="none">
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="low" className="ml-2 text-base font-medium text-[#1F1E22]">Low</label>
            </div>
          </div>

          {errors.investmentError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please select your investment appetite
              </span>
            </div>
          }
        </div>

        {/* Portfolio type */}
        <div className="mb-6">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="portfolioType">
            Preferred Portfolio Type
          </label>
          <div className='relative w-full'>
            <select
              className="appearance-none w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 cursor-pointer"
              name='portfolioType'
              value={""}
              onChange={handleChange}
            >
              <option value="">Select Portfolio Type</option>
              <option value="Bitcoin Trust Fund" className='text-[#7C7C7A]'>
                Bitcoin Trust Fund
              </option>
              <option value="Varied Asset Fund" className='text-[#7C7C7A]'>
                Varied Asset Fund
              </option>
              <option value="Specialized AI Fund" className="text-[#7C7C7A]">
                Specialized AI Fund
              </option>
            </select>

            <div className="absolute top-[45%] right-3 -translate-y-1/2 pointer-events-none cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {localData.portfolioType.map((option, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full cursor-pointer hover:bg-purple-200"
                onClick={() =>
                  setLocalData((prev) => ({
                    ...prev,
                    portfolioType: prev.portfolioType.filter((item) => item !== option),
                  }))
                }
              >
                {option}
                {/* An "x" icon for removal */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            ))}
          </div>


          {errors.portfolioError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please choose a preferred portfolio
              </span>
            </div>
          }
        </div>

        {/* Proceed Button */}
        <button
          type="submit"
          className={`w-full text-white py-2 rounded transition-colors ${complete() ? "bg-[#D9D9D9]" : "bg-[#8627FF]"} `}
          disabled={complete()}
        >
          Proceed
        </button>
      </form>
    </div>
  );
}

// ===================================================================
// STEP THREE COMPONENT (only for individuals)
// ===================================================================

type StepThreeProps = {
  data: FormData;
  onNext: (data: Partial<FormData>) => void;
};

function StepThree({ data, onNext }: StepThreeProps) {
  const [localData, setLocalData] = useState({
    investmentAmount: data.investmentAmount || "",
    investmentType: data.investmentType || "",
    investmentDuration: data.investmentDuration || ""
  });

  const [errors, setErrors] = useState({
    investmentAmountError: false,
    investmentTypeError: false,
    investmentDurationError: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newLocalData = {
      ...localData,
      [name]: value,
    };

    // Validate Investment Amount
    if (name === "investmentAmount") {
      if (value === "" || /[a-z]/.test(value) || /[A-Z]/.test(value) || /[!@#$%^&*()_+\-=\[\]{};':"\\|.<>\/?]/.test(value)) {
        setErrors((prev) => ({ ...prev, investmentAmountError: true }));
      } else {
        setErrors((prev) => ({ ...prev, investmentAmountError: false }));
      }
    }

    // Validate Investment Type
    if (name === "investmentType") {
      if (value === "") {
        setErrors((prev) => ({ ...prev, investmentTypeError: true }));
      } else {
        setErrors((prev) => ({ ...prev, investmentTypeError: false }));
      }
    }

    // Validate Investment Duration
    if (name === "investmentDuration") {
      if (value === "") {
        setErrors((prev) => ({ ...prev, investmentDurationError: true }));
      } else {
        setErrors((prev) => ({ ...prev, investmentDurationError: false }));
      }
    }

    setLocalData(newLocalData);
    // console.log(newLocalData)
  }

  function complete() {
    if (errors.investmentAmountError || errors.investmentTypeError || errors.investmentDurationError || localData.investmentAmount === "" || localData.investmentType === "" || localData.investmentDuration === "") {
      return true;
    }

    return false;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(localData);
  };

  return (
    <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 p-9 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Investment Details
      </h2>
      <p className="text-sm text-[#8C8B90] mb-6">
        Enter your investment details to get started. Make sure all information is accurate.
      </p>

      <form action="" onSubmit={handleSubmit}>
        {/* Investment Amount */}
        <div className="mb-4">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="investmentAmount">
            Investment Amount ($)
          </label>
          <input
            id="investmentAmount"
            type="text"
            placeholder="Enter Amount"
            className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            name='investmentAmount'
            value={localData.investmentAmount}
            onChange={handleChange}
          />
          {errors.investmentAmountError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please enter a valid investment amount
              </span>
            </div>
          }
        </div>

        {/* Investment Type */}
        <div className="mb-6">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="investmentType">
            Investment Type
          </label>
          <div className='relative w-full'>
            <select
              className="appearance-none w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 cursor-pointer"
              name='investmentType'
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="One Time" className='text-[#7C7C7A]'>
                One Time
              </option>
              <option value="Recurring" className='text-[#7C7C7A]'>
                Recurring
              </option>
            </select>

            <div className="absolute top-[45%] right-3 -translate-y-1/2 pointer-events-none cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
          {errors.investmentTypeError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please select an investment type
              </span>
            </div>
          }
        </div>

        {/* Investment Duration */}
        <div className="mb-6">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="investmentDuration">
            Investment Duration
          </label>
          <div className='relative w-full'>
            <select
              className="appearance-none w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 cursor-pointer"
              name='investmentDuration'
              onChange={handleChange}
            >
              <option value="">Select Duration</option>
              <option value="3 Months" className='text-[#7C7C7A]'>
                3 Months
              </option>
              <option value="6 Months" className='text-[#7C7C7A]'>
                6 Months
              </option>
              <option value="1 year" className='text-[#7C7C7A]'>
                1 year
              </option>
            </select>

            <div className="absolute top-[45%] right-3 -translate-y-1/2 pointer-events-none cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
          {errors.investmentTypeError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please select an investment type
              </span>
            </div>
          }
        </div>

        {/* Proceed Button */}
        <button
          type="submit"
          className={`w-full text-white py-2 rounded transition-colors ${complete() ? "bg-[#D9D9D9]" : "bg-[#8627FF]"} `}
          disabled={complete()}
        >
          Proceed
        </button>
      </form>
    </div>
  );
}

// ===================================================================
// STEP FOUR COMPONENT (only for individuals)
// ===================================================================

type StepFourProps = {
  data: FormData;
  onNext: (data: Partial<FormData>) => void;
};

function StepFour({ data, onNext }: StepFourProps) {
  const [localData, setLocalData] = useState({
    bankName: data.bankName,
    accountNumber: data.accountNumber
  });

  const banks = [
    { name: 'Access Bank', image: "/access.svg" },
    { name: 'First Bank', image: "/first-bank.svg" },
    { name: 'Kuda', image: "/kuda.svg" },
    { name: 'Opay', image: "/opay.svg" },
  ]

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleBankSelect = (bankName: string) => {
    setLocalData(prev => ({ ...prev, bankName }));
    setErrors(prev => ({ ...prev, bankNameError: false }));
    setIsDropdownOpen(false);
  };

  const [errors, setErrors] = useState({
    bankNameError: false,
    accountNumberError: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newLocalData = {
      ...localData,
      [name]: value,
    };

    if (name === 'accountNumber') {
      if (value === "" || /[a-z]/.test(value) || /[A-Z]/.test(value) || /[!@#$%^&*()_+\-=\[\]{};':"\\|.,<>\/?]/.test(value) || value.length < 10) {
        setErrors((prev) => ({ ...prev, accountNumberError: true }));
      } else {
        setErrors((prev) => ({ ...prev, accountNumberError: false }));
      }
    }

    setLocalData(newLocalData);
  }

  function complete() {
    if (errors.bankNameError || errors.accountNumberError || localData.bankName === "" || localData.accountNumber === "") {
      return true;
    }

    return false;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(localData)
    // console.log(localData)
  }

  return (
    <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Bank Details
      </h2>
      <p className="text-sm text-[#8C8B90] mb-6">
        Provide your bank details to ensure smooth withdrawals and payouts.
      </p>

      <form action="" onSubmit={handleSubmit}>
        {/* Bank Name */}
        <div className="mb-6">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="bankName">
            Bank Name
          </label>

          <select
            name="bankName"
            value={localData.bankName}
            className="hidden"
            onChange={handleChange}
          >
            <option value="">Select Bank</option>
            {banks.map(bank => (
              <option key={bank.name} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>

          <div className='relative w-full'>
            <button
              type="button"
              className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl flex items-center justify-between"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-3">
                {localData.bankName ? (
                  <>
                    <Image
                      src={banks.find(b => b.name === localData.bankName)?.image || ''}
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span>{localData.bankName}</span>
                  </>
                ) : (
                  <span className="text-[#7C7C7A]">Select Bank</span>
                )}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide lucide-chevron-down transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown options */}
            {isDropdownOpen && (
              <div className="absolute w-full mt-2 bg-white border border-[#D9D9D9] rounded-xl shadow-lg z-10">
                {banks.map(bank => (
                  <div
                    key={bank.name}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleBankSelect(bank.name)}
                  >
                    <Image
                      src={bank.image}
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span className="text-[#1F1E22]">{bank.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.bankNameError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please select a bank name
              </span>
            </div>
          }
        </div>

        {/* Account Number */}
        <div className="mb-4">
          <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="accountNumber">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            placeholder="Enter Amount Number"
            className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
            name='accountNumber'
            value={localData.accountNumber}
            onChange={handleChange}
            maxLength={10}
          />
          {errors.accountNumberError &&
            <div className='flex gap-1 items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-sm text-[#D02A2A] font-medium">
                Please enter a valid account number
              </span>
            </div>
          }
        </div>

        {/* Proceed Button */}
        <button
          type="submit"
          className={`w-full text-white py-2 rounded transition-colors ${complete() ? "bg-[#D9D9D9]" : "bg-[#8627FF]"} `}
          disabled={complete()}
        >
          Proceed
        </button>
      </form>
    </div>
  );
}

// ===================================================================
// STEP FIVE COMPONENT (common to both flows)
// ===================================================================

type StepFiveProps = {
  data: FormData & { userType: "individual" | "business" };
  onNext: (data: Partial<FormData>) => void;
};

interface UploadedFile {
  file: File;
  previewUrl: string; // For images
  progress: number;   // 0-100
  error?: string;     // Error message if invalid
}

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function StepFive({ data, onNext }: StepFiveProps) {
  // Determine required document count based on user type
  const requiredDocs = data.userType === "business" ? 3 : 2;
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);
  const [selfieFile, setSelfieFile] = useState<UploadedFile | null>(null);

  // For camera capture of selfie
  const [capturing, setCapturing] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'ready'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // -------------------------------
  // Document Upload Section
  // -------------------------------
  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (!files) return;

      const newDocs: UploadedFile[] = [];
      Array.from(files).forEach((file) => {
          // Validate file type
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
              newDocs.push({
                  file,
                  previewUrl: "",
                  progress: 0,
                  error: "Unsupported file type",
              });
              return;
          }
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
              newDocs.push({
                  file,
                  previewUrl: "",
                  progress: 0,
                  error: "File size exceeds limit",
              });
              return;
          }
          // Create a preview URL for image files
          let previewUrl = "";
          if (file.type.startsWith("image/")) {
              previewUrl = URL.createObjectURL(file);
          }
          newDocs.push({
              file,
              previewUrl,
              progress: 100,
          });
      });

      // Only allow up to requiredDocs
      setUploadedDocuments((prev) => {
          const combined = [...prev, ...newDocs];
          return combined.slice(0, requiredDocs);
      });
      e.target.value = "";
  };

  // -------------------------------
  // Selfie Capture Section
  // -------------------------------
  // const startCamera = async () => {
  //     try {
  //         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //         setVideoStream(stream);
  //         setCapturing(true);
  //         if (videoRef.current) {
  //             videoRef.current.srcObject = stream;
  //         }
  //     } catch (error) {
  //         console.error("Error accessing camera", error);
  //         alert("Unable to access camera");
  //     }
  // };

  // const startCamera = async () => {
  //     setCameraError(null);
  //     setCameraStatus('starting');

  //     try {
  //         // Try to get specific front camera
  //         const devices = await navigator.mediaDevices.enumerateDevices();
  //         const videoDevices = devices.filter(d => d.kind === 'videoinput');
  //         const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes('front'));

  //         const constraints = frontCamera?.deviceId
  //             ? { deviceId: { exact: frontCamera.deviceId } }
  //             : { facingMode: 'user' };

  //         const stream = await navigator.mediaDevices.getUserMedia({
  //             video: constraints
  //         });

  //         if (videoRef.current) {
  //             const video = videoRef.current;
  //             video.srcObject = stream;

  //             // Wait for video to actually start playing
  //             await video.play().catch(err => {
  //                 throw new Error('Camera failed to start: ' + err.message);
  //             });

  //             // Verify video is actually producing frames
  //             await new Promise<void>((resolve, reject) => {
  //                 const timeout = setTimeout(() => {
  //                     reject(new Error('Camera timeout - no frames received'));
  //                 }, 5000);

  //                 video.onplaying = () => {
  //                     clearTimeout(timeout);
  //                     resolve();
  //                 };
  //             });

  //             setCameraStatus('ready');
  //             setCapturing(true);
  //         }
  //     } catch (error) {
  //         console.error("Camera error:", error);
  //         setCameraStatus('idle');
  //         setCameraError(
  //             error instanceof Error ? error.message : 'Failed to access camera'
  //         );
  //         stopCamera();
  //     }
  // };

  const startCamera = async () => {
      setCameraError(null);
      setCameraStatus('starting');

      try {
          // Feature detection for mediaDevices
          if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
              throw new Error('Camera access is not supported by your browser');
          }

          let constraints: MediaStreamConstraints['video'] = { facingMode: 'user' };

          try {
              // Attempt to find front camera (might fail on some mobile browsers)
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoDevices = devices.filter(d => d.kind === 'videoinput');
              const frontCamera = videoDevices.find(d =>
                  d.label.toLowerCase().includes('front') ||
                  d.label.toLowerCase().includes('user')
              );

              if (frontCamera?.deviceId) {
                  constraints = { deviceId: { exact: frontCamera.deviceId } };
              }
          } catch (enumerationError) {
              // Fallback to generic facingMode if enumeration fails
              console.warn('Camera enumeration failed, using facingMode', enumerationError);
              constraints = { facingMode: 'user' };
          }

          const stream = await navigator.mediaDevices.getUserMedia({
              video: constraints
          });

          if (videoRef.current) {
              const video = videoRef.current;
              video.srcObject = stream;

              // Wait for video to actually start playing
              await video.play().catch((err: { message: string; }) => {
                  throw new Error('Camera failed to start: ' + err.message);
              });

              // Verify video is actually producing frames
              await new Promise<void>((resolve, reject) => {
                  const timeout = setTimeout(() => {
                      reject(new Error('Camera timeout - no frames received'));
                  }, 5000);

                  video.onplaying = () => {
                      clearTimeout(timeout);
                      resolve();
                  };
              });

              setCameraStatus('ready');
              setCapturing(true);
          }
      } catch (error) {
          console.error("Camera error:", error);
          setCameraStatus('idle');
          setCameraError(
              error instanceof Error ? error.message : 'Camera access denied. Please enable camera permissions.'
          );
          stopCamera();
      }
  };

  // const captureSelfie = () => {
  //     console.log("clicked 1")
  //     if (!videoRef.current) return;
  //     console.log("clicked 2")

  //     const video = videoRef.current;
  //     // Check that the video has loaded dimensions
  //     const width = video.videoWidth;
  //     const height = video.videoHeight;
  //     if (width === 0 || height === 0) {
  //         console.log("clicked 4")

  //         // Wait a little and try again or attach a listener
  //         video.onloadedmetadata = () => {
  //             captureSelfie();
  //         };
  //         return;
  //     }

  //     console.log("clicked 3")

  //     // Create an off-screen canvas with proper dimensions
  //     const canvas = document.createElement("canvas");
  //     canvas.width = width;
  //     canvas.height = height;
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) {
  //         console.error("Could not get canvas context");
  //         return;
  //     }
  //     ctx.drawImage(video, 0, 0, width, height);

  //     // Use toBlob to create a File object from the canvas image
  //     canvas.toBlob((blob) => {
  //         if (blob) {
  //             const file = new File([blob], "selfie.png", { type: "image/png" });
  //             const previewUrl = URL.createObjectURL(file);
  //             console.log("Selfie captured:", previewUrl);
  //             setSelfieFile({
  //                 file,
  //                 previewUrl,
  //                 progress: 100,
  //             });
  //         } else {
  //             console.error("Failed to capture selfie blob");
  //         }
  //     }, "image/png");

  //     stopCamera();
  // };

  const captureSelfie = () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const maxAttempts = 10;
      let attempts = 0;

      const checkReadiness = () => {
          attempts++;
          if (attempts > maxAttempts) {
              console.error("Camera never became ready");
              setCameraError('Camera failed to initialize');
              stopCamera();
              return;
          }

          if (video.videoWidth > 0 && video.videoHeight > 0) {
              actuallyCapture();
          } else {
              setTimeout(checkReadiness, 100);
          }
      };

      const actuallyCapture = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
              setCameraError('Failed to capture image');
              return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
              if (blob) {
                  const file = new File([blob], "selfie.png", { type: "image/png" });
                  setSelfieFile({
                      file,
                      previewUrl: URL.createObjectURL(file),
                      progress: 100,
                  });
                  stopCamera();
              } else {
                  setCameraError('Failed to capture photo');
              }
          }, "image/png");
      };

      checkReadiness();
  };


  const stopCamera = () => {
      if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
      }
      setVideoStream(null);
      setCapturing(false);
  };


  // -------------------------------
  // Updated Camera UI Section
  // -------------------------------
  const renderCameraInterface = () => {
      if (cameraError) {
          return (
              <div className="text-center p-4 border rounded-lg bg-red-50">
                  <p className="text-red-600 mb-2">{cameraError}</p>
                  <button
                      onClick={startCamera}
                      className="py-2 px-4 bg-purple-600 text-white rounded"
                  >
                      Retry Camera
                  </button>
              </div>
          );
      }

      {
          cameraError && (
              <div className="text-red-600 text-sm mt-2">
                  {cameraError.includes('not supported') ? (
                      <>
                          Your browser doesn't support camera access.
                          Try updating your browser or using Chrome/Firefox.
                      </>
                  ) : (
                      cameraError
                  )}
              </div>
          )
      }

      if (cameraStatus === 'starting') {
          return (
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 rounded-full border-t-transparent mb-4"></div>
                  <p className="text-sm text-gray-600">Initializing camera...</p>
                  <p className="text-xs text-gray-500 mt-1">
                      Please allow camera access if prompted
                  </p>
              </div>
          );
      }

      if (capturing) {
          return (
              <div className="flex flex-col items-center">
                  <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full max-w-[35rem] rounded-md border"
                  />
                  <div className="mt-4 flex gap-2">
                      <button
                          type="button"
                          onClick={captureSelfie}
                          className="py-2 px-4 rounded-md bg-green-600 text-white"
                      >
                          Capture Selfie
                      </button>
                      <button
                          type="button"
                          onClick={stopCamera}
                          className="py-2 px-4 rounded-md bg-gray-600 text-white"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          );
      }

      return (
          <button
              type="button"
              onClick={startCamera}
              className="w-full py-2 rounded-md bg-purple-600 text-white"
          >
              Open Camera to Take Selfie
          </button>
      );
  };

  // -------------------------------
  // Proceed handler
  // -------------------------------
  const handleProceed = () => {
      const finalFiles = [...uploadedDocuments.map((doc) => doc.file)];
      if (selfieFile) {
          finalFiles.push(selfieFile.file);
      }
      onNext({ files: finalFiles });
  };

  return (
      <div>
          <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9 mx-auto">
              <h1 className="text-2xl font-bold mb-2 text-black">KYC Documents</h1>
              <p className="text-sm text-gray-500 mb-6">
                  Upload the following documents to verify your KYC
              </p>

              {/* List of Required Documents */}
              <div className="mb-6">
                  <h2 className="text-base font-semibold text-black mb-2">Documents required</h2>
                  {data.userType === "individual" ? (
                      <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                          <li>Government ID</li>
                          <li>Proof of Address</li>
                          <li>Selfie Verification</li>
                      </ul>
                  ) : (
                      data.userType === "business" && (
                          <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                              <li>Certificate Of Incorporation</li>
                              <li>Valid ID of Business Owner</li>
                              <li>Proof of Business Address</li>
                              <li>Selfie Verification</li>
                          </ul>
                      )
                  )}
              </div>

              {/* Documents Upload Section */}
              <div className="mb-6">
                  <label htmlFor="uploadDocuments" className="block text-base font-medium text-black mb-2">
                      Upload Documents ({uploadedDocuments.length}/{requiredDocs})
                  </label>
                  <div
                      className={`relative border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer text-gray-500 flex flex-col items-center ${uploadedDocuments.length >= requiredDocs ? "opacity-50 pointer-events-none" : ""
                          }`}
                  >
                      <Image src="/icon.svg" alt="" width={32} height={32} />
                      <p className="font-medium">Click to upload</p>
                      <p className="text-xs">Supported file types: JPG, PNG, PDF</p>
                      <input
                          type="file"
                          id="uploadDocuments"
                          multiple
                          onChange={handleDocumentsChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Please upload {requiredDocs} documents</p>
              </div>

              <div className="space-y-4 mb-6">
                  {uploadedDocuments.map((fileObj, index) => (
                      <div key={index} className="border rounded-md p-3 flex items-center gap-3 relative">
                          {/* Show preview for image files */}
                          {!fileObj.error && fileObj.previewUrl ? (
                              <Image
                                  src={fileObj.previewUrl}
                                  alt={fileObj.file.name}
                                  className="w-12 h-12 object-cover rounded"
                                  width={48}
                                  height={48}
                              />
                          ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
                                  {fileObj.file.type === "application/pdf" && !fileObj.error ? (
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-6 h-6"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                      >
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                      </svg>
                                  ) : (
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-6 h-6 text-red-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                      >
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                                      </svg>
                                  )}
                              </div>
                          )}
                          <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 truncate">{fileObj.file.name}</p>
                              <p className="text-xs text-gray-400">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                              {fileObj.error ? (
                                  <p className="text-xs text-red-500 font-medium mt-1">{fileObj.error}</p>
                              ) : (
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${fileObj.progress}%` }} />
                                  </div>
                              )}
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                              <button
                                  className="focus:outline-none hover:text-red-600"
                                  title="Remove"
                                  onClick={() =>
                                      setUploadedDocuments((prev) => prev.filter((_, i) => i !== index))
                                  }
                              >
                                  <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      viewBox="0 0 24 24"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m-4 0h12"
                                      />
                                  </svg>
                              </button>
                              {!fileObj.error && <span className="text-sm text-gray-400">{fileObj.progress}%</span>}
                          </div>
                      </div>
                  ))}
              </div>

              {/* -------------------------------
          Selfie Capture Section
      ------------------------------- */}
              <div className="mb-6">
                  <label className="block text-base font-medium text-black mb-2">
                      Selfie Verification
                  </label>
                  {selfieFile ? (
                      <div className="mt-4 flex items-center gap-3">
                          <Image
                              src={selfieFile.previewUrl}
                              alt="Selfie"
                              className="w-12 h-12 object-cover rounded"
                              width={48}
                              height={48}
                          />
                          <p className="text-sm font-medium text-gray-700 truncate">Selfie Captured</p>
                          <button
                              type="button"
                              onClick={() => setSelfieFile(null)}
                              className="py-1 px-2 bg-yellow-500 text-white rounded"
                          >
                              Retake
                          </button>
                      </div>
                  ) : (
                      renderCameraInterface()
                  )}
              </div>

              {/* -------------------------------
          Proceed Button
      ------------------------------- */}
              <button
                  type="button"
                  className={`w-full text-white py-2 rounded-md font-medium ${uploadedDocuments.length < requiredDocs || !selfieFile
                      ? "bg-[#D9D9D9]"
                      : "bg-[#8627FF]"
                      }`}
                  disabled={uploadedDocuments.length < requiredDocs || !selfieFile}
                  onClick={handleProceed}
              >
                  Proceed
              </button>
          </div>
      </div>
  );
}