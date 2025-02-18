'use client'
import { Check } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);

  type FormData = {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;

    // Step 2 fields
    dob: string;
    address: string;
    investment: string;
    portfolioType: string[];
    accountType: string;

    files: File[]
  };

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "",
    investment: "",
    portfolioType: [],
    accountType: "",
    files: []
  });

  type StepOneProps = {
    data: Pick<FormData,
      'fullName' |
      'email' |
      'password' |
      'confirmPassword'
    >;
    onNext: (stepData: Pick<FormData,
      'fullName' |
      'email' |
      'password' |
      'confirmPassword'
    >) => void;
  };

  type StepTwoProps = {
    data: Pick<FormData,
      'dob' |
      'address' |
      'investment' |
      'portfolioType' |
      'accountType'
    >;
    onNext: (stepData: Pick<FormData,
      'dob' |
      'address' |
      'investment' |
      'portfolioType' |
      'accountType'
    >) => void;
  };

  type StepThreeProps = {
    data: Pick<FormData, 'files' | 'accountType'>;
    onNext: (stepData: Pick<FormData, 'files'>) => void;
  };

  interface UploadedFile {
    file: File;
    previewUrl: string;  // For images
    progress: number;    // 0-100
    error?: string;      // Error message if invalid
  }

  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  function ProgressBar() {
    return (
      <div className="flex space-x-2 mb-8 w-[19rem]">
        <div
          className={`w-24 h-2 rounded-2xl ${currentStep === 1 ? "bg-white" : "bg-white/50"
            }`}
        />
        <div
          className={`w-24 h-2 rounded-2xl ${currentStep === 2 ? "bg-white" : "bg-white/50"
            }`}
        />
        <div
          className={`w-24 h-2 rounded-2xl ${currentStep === 3 ? "bg-white" : "bg-white/50"
            }`}
        />
      </div>
    );
  };

  const handleNext = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep === 3) {
      handleSubmitAll({ ...formData, ...stepData });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // const handlePrev = () => {
  //   setCurrentStep((prev) => prev - 1);
  // };

  const handleSubmitAll = (finalData: FormData) => {
    // In a real app, send finalData to your backend API
    // e.g. fetch('/api/register', { method: 'POST', body: JSON.stringify(finalData) })
    console.log("Submitting final data:", finalData);
    alert("All steps completed! Check console for final data.");
  };

  function StepOne({ onNext }: StepOneProps) {
    interface LocalData {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }

    const [localData, setLocalData] = useState<LocalData>({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const [errors, setErrors] = useState({
      emailError: false,
      nameError: false,
      passwordError: false,
      confirmPasswordError: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState({
      hasUppercase: false,
      hasLowercase: false,
      hasSpecialChar: false,
      hasNumber: false,
      isLongEnough: false,
      isMatching: false
    });

    function togglePasswordVisibility() {
      setShowPassword(!showPassword);
    }

    function validatePassword(password: string) {
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
        isLongEnough,
      };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      // Build the *new* state object before setting it
      const newLocalData = {
        ...localData,
        [name]: value,
      };

      // Validate name
      if (name === 'fullName') {
        if (value === "" || /\d/.test(value)) {
          setErrors(prev => ({ ...prev, nameError: true }));
        } else {
          setErrors(prev => ({ ...prev, nameError: false }));
        }
      }

      // Validate email
      if (name === 'email') {
        if (value === "" || !/^\S+@\S+\.\S+$/.test(value)) {
          setErrors(prev => ({ ...prev, emailError: true }));
        } else {
          setErrors(prev => ({ ...prev, emailError: false }));
        }
      }

      // Validate password
      if (name === 'password') {
        const { isValid, hasUppercase, hasLowercase, hasSpecialChar, hasNumber, isLongEnough } = validatePassword(value);
        setErrors(prev => ({ ...prev, passwordError: !isValid }));
        setValidation(prev => ({
          ...prev,
          hasUppercase,
          hasLowercase,
          hasSpecialChar,
          hasNumber,
          isLongEnough,
        }));
      }

      // Validate confirmPassword (or check matching whenever either password or confirmPassword changes)
      if (name === 'confirmPassword' || name === 'password') {
        const isMatching = newLocalData.password === newLocalData.confirmPassword;
        setErrors(prev => ({ ...prev, confirmPasswordError: !isMatching }));
      }

      // Finally, set state once using the newLocalData
      setLocalData(newLocalData);
    };

    function complete() {
      if (errors.nameError || errors.emailError || errors.passwordError || errors.confirmPasswordError || localData.fullName === "" || localData.email === "" || localData.password === "" || localData.confirmPassword === "") {
        // alert("Please fill out all required fields and ensure your password meets the criteria.");
        return true;
      }

      return false;
    }


    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onNext(localData);
    };

    return (
      <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9">
        <h2 className="text-2xl font-bold mb-4 text-black">
          Account Registration
        </h2>
        <p className="text-sm text-[#8C8B90] mb-6">
          Create your account by entering your details to get started.
          Secure, quick, and hassle-free registration.
        </p>

        <form action="" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter Full Name"
              className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              value={localData.fullName}
              name="fullName"
              onChange={handleChange}
            />
            {
              errors.nameError &&
              <div className='flex gap-1 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-sm text-[#D02A2A] font-medium">
                  Please enter your full name
                </span>
              </div>
            }
          </div>

          {/* Email Address */}
          <div className="mb-4">
            <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter Email Address"
              className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              value={localData.email}
              name="email"
              onChange={handleChange}
            />
            {
              errors.emailError &&
              <div className='flex gap-1 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-sm text-[#D02A2A] font-medium">
                  Please enter a valid email address
                </span>
              </div>
            }
          </div>

          {/* Create Password */}
          <div className="mb-4">
            <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="password">
              Create Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                value={localData.password}
                name="password"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-[45%] -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                    <path d="m2 2 20 20" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.passwordError &&
              <div className='flex gap-1 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-sm text-[#D02A2A] font-medium">
                  Passwords must check all criteria below
                </span>
              </div>

            }

            <div className="mt-2 flex flex-wrap gap-2">
              <div
                className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.isLongEnough ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#E4E7EC]"}`}
              >
                <span className={`text-sm ${validation.isLongEnough ? 'text-[#8627FF]' : 'text-[#929292]'}`}>
                  8 characters
                </span>
                <Check
                  size={16}
                  color={`${validation.isLongEnough ? '#8627FF' : '#929292'}`}
                />
              </div>
              <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasUppercase ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#E4E7EC]"}`}>
                <span className={`text-sm ${validation.hasUppercase ? 'text-[#8627FF]' : 'text-[#929292]'}`}>Uppercase</span>
                <Check
                  size={16}
                  color={`${validation.hasUppercase ? '#8627FF' : '#929292'}`}
                />
              </div>
              <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasNumber ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#E4E7EC]"}`}>
                <span className={`text-sm ${validation.hasNumber ? 'text-[#8627FF]' : 'text-[#929292]'}`}>Number</span>
                <Check
                  size={16}
                  color={`${validation.hasNumber ? '#8627FF' : '#929292'}`}
                />
              </div>
              <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasLowercase ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#E4E7EC]"}`}>
                <span className={`text-sm ${validation.hasLowercase ? 'text-[#8627FF]' : 'text-[#929292]'}`}>Lowercase</span>
                <Check
                  size={16}
                  color={`${validation.hasLowercase ? '#8627FF' : '#929292'}`}
                />
              </div>
              <div className={`flex gap-1 items-center p-2 rounded-3xl border ${validation.hasSpecialChar ? "border-[#AE6EFF] bg-[#F3E9FF]" : "border-[#E4E7EC]"}`}>
                <span className={`text-sm ${validation.hasSpecialChar ? 'text-[#8627FF]' : 'text-[#929292]'}`}>Special characters</span>
                <Check
                  size={16}
                  color={`${validation.hasSpecialChar ? '#8627FF' : '#929292'}`}
                />
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-Enter Password"
              className="w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              value={localData.confirmPassword}
              name='confirmPassword'
              onChange={handleChange}
            />

            {errors.confirmPasswordError &&
              <div className='flex gap-1 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-sm text-[#D02A2A] font-medium">Passwords do not match</span>
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
    )
  }

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
      accountType: data.accountType
    });

    const [errors, setErrors] = useState({
      dateError: false,
      addressError: false,
      investmentError: false,
      portfolioError: false,
      accountError: false,
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

      // Validate account type
      if (name === "accountType") {
        if (value === "") {
          setErrors(prev => ({ ...prev, accountError: true }))
        } else {
          setErrors(prev => ({ ...prev, accountError: false }))
        }
      }

      setLocalData(newLocalData);
    };

    function complete() {
      if (errors.dateError || errors.addressError || errors.investmentError || errors.portfolioError || errors.accountError || localData.dob === "" || localData.address === "" || localData.investment === "" || localData.portfolioType.length === 0 || localData.accountType === "") {
        return true;
      }

      return false;
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onNext(localData);
    };

    return (
      <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9">
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

          {/* Account Type */}
          <div className="mb-6">
            <label className="block text-base font-medium text-[#1F1E22] mb-2" htmlFor="accountType">
              Account Type
            </label>
            <div className='relative w-full'>
              <select
                className="appearance-none w-full p-3 border border-[#D9D9D9] text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 cursor-pointer"
                name='accountType'
                onChange={handleChange}
              >
                <option value="">Select Account Type</option>
                <option value="Individual Account" className='text-[#7C7C7A]'>
                  Individual Account
                </option>
                <option value="Business Account" className='text-[#7C7C7A]'>
                  Business Account
                </option>
              </select>

              <div className="absolute top-[45%] right-3 -translate-y-1/2 pointer-events-none cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
            {errors.accountError &&
              <div className='flex gap-1 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#d02a2a" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-sm text-[#D02A2A] font-medium">
                  Please select a valid account type
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
    )
  }

  function StepThree({ data, onNext }: StepThreeProps) {
    // For real file uploads, you'd store and manage files in state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
      // Initialize from parent's data.files
      const initialFiles = data.files.map(file => ({
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        progress: 100,
        error: undefined
      }));
      setUploadedFiles(initialFiles);
    }, [data.files]);

    const handleProceed = () => {
      const files = uploadedFiles.map(uf => uf.file);
      onNext({ files });
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (!files) return;

      const newFiles: UploadedFile[] = [];

      // Convert FileList to an array
      Array.from(files).forEach((file) => {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          newFiles.push({
            file,
            previewUrl: "",
            progress: 0,
            error: "Unsupported file type",
          });
          return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          newFiles.push({
            file,
            previewUrl: "",
            progress: 0,
            error: "File size exceeds 5MB limit",
          });
          return;
        }

        // Create a preview URL if it's an image
        let previewUrl = "";
        if (file.type === "image/jpeg" || file.type === "image/png") {
          previewUrl = URL.createObjectURL(file);
        }

        newFiles.push({
          file,
          previewUrl,
          progress: 0,
        });
      });

      // Add the new files to state
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Reset the input value so user can re-upload the same file if needed
      e.target.value = "";
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            // Skip errored files or completed ones
            if (f.error || f.progress >= 100) return f;

            const newProgress = f.progress + 10;
            return { ...f, progress: Math.min(newProgress, 100) };
          })
        );
      }, 500); // increments progress every 0.5s

      return () => clearInterval(interval);
    }, []);

    // Remove a file from the list
    const removeFile = (index: number) => {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div>
        {/* Card Container */}
        <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9">
          {/* Heading */}
          <h1 className="text-2xl font-bold mb-2 text-black">KYC Uploads</h1>
          <p className="text-sm text-gray-500 mb-6">
            Secure your account by uploading the required KYC documents for verification.
          </p>

          {/* List of Required Documents */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-black mb-2">
              List of Documents required
            </h2>
            { data.accountType === "Individual Account" ?
              <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                <li>Government ID</li>
                <li>Proof of Address</li>
                <li>Selfie Verification</li>
              </ul> :
              data.accountType === "Business Account" && 
              <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                <li>Certificate Of Incorporation</li>
                <li>Valid ID of Business Owner</li>
                <li>Proof of Business Address</li>
                <li>Selfie Verification</li>
              </ul>
            }
          </div>

          {/* Upload Document Section */}
          <div className="mb-6">
            <label
              htmlFor="uploadDocument"
              className="block text-base font-medium text-black mb-2"
            >
              Upload Document
            </label>
            <div className="relative border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer text-gray-500 flex flex-col items-center">
              <Image
                src={"/icon.svg"}
                alt=""
                width={32}
                height={32}
                className=""
              />
              <p className="font-medium">Click to upload</p>
              <p className="text-xs">Supported file includes JPG, PNG, PDF</p>
              <input
                type="file"
                id="uploadDocument"
                multiple
                onChange={handleFileChange} // Uncomment to handle actual file uploads
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Acceptable document must be less than 3 months old
            </p>
          </div>

          {/* Example: Preview of an uploaded file */}
          <div className="space-y-4 mb-6">
            {uploadedFiles.map((fileObj, index) => (
              <div
                key={index}
                className="border rounded-md p-3 flex items-center gap-3 relative"
              >
                {/* If it's an image and no error, show preview */}
                {!fileObj.error && fileObj.previewUrl ? (
                  <img
                    src={fileObj.previewUrl}
                    alt={fileObj.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  // Otherwise, show PDF icon or error icon
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    ) : (
                      // Show error or a generic icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                        />
                      </svg>
                    )}
                  </div>
                )}

                {/* File details */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {fileObj.error ? (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {fileObj.error}
                    </p>
                  ) : (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${fileObj.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Delete icon & progress text */}
                <div className="flex items-center space-x-2 text-gray-500">
                  <button
                    className="focus:outline-none hover:text-red-600"
                    title="Remove"
                    onClick={() => removeFile(index)}
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
                  {!fileObj.error && (
                    <span className="text-sm text-gray-400">{fileObj.progress}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Proceed Button */}
          <button
            type="button"
            className={`w-full text-white py-2 rounded-md font-medium ${uploadedFiles.length === 0 ? "bg-[#D9D9D9]" : "bg-[#8627FF]"}`}
            disabled={uploadedFiles.length === 0}
            onClick={handleProceed}
          >
            Proceed to Take Selfie
          </button>
        </div>
      </div>
    );
  }

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

      {/* Main container */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="mb-8">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={80}
            height={80}
          />
        </div>

        {/* Title */}
        <h1 className="text-white text-[2rem] text-center font-bold mb-2">
          Account Creation & KYC
        </h1>

        <ProgressBar />

        {/* Registration Card */}
        {currentStep === 1 && (
          <StepOne data={formData} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <StepTwo data={formData} onNext={handleNext} />
        )}
        {currentStep === 3 && (
          <StepThree data={formData} onNext={handleNext} />
        )}
      </div>
    </div>
  )
};