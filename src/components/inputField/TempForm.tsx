"use client";
import InputField from "./InputField";

import React, { useState } from "react";
import AuthInput from "./AuthInput";
import { loginSchema } from "~/lib/validation";
import { useFormik } from "formik";
import InputArea from "./InputArea";

const TempForm = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const { errors, touched, handleChange, handleBlur, handleSubmit, values } =
    formik;

  const [showPass, setShowPass] = useState(false);
  const [inputFieldValue, setInputFieldValue] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4">
        <AuthInput
          id="email"
          label="Email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your email"
          error={errors.email}
          touched={touched.email}
        />
        <AuthInput
          id="name"
          label="Name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your name"
          error={errors.name}
          touched={touched.name}
        />
        <AuthInput
          id="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password"
          showPass={showPass}
          setShowPass={setShowPass}
          error={errors.password}
          touched={touched.password}
        />
      </div>
      <InputField
        className="mt-16"
        id="inputField"
        label="Input Field"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your email"
        error={errors.email}
        touched={touched.email}
      />

      <p>{inputFieldValue}</p>
      <InputArea
        className="mt-4"
        id="random"
        label="Random"
        onChange={(e) => setInputFieldValue(e.target.value)}
        placeholder="Enter random text"
      />
    </div>
  );
};

export default TempForm;
