export const getEnvVariable = (value: string) => {
  const envVariable = process.env[value];
  if (!envVariable) {
    throw new Error(`Environment variable ${value} is not defined`);
  }
  
  return envVariable;
}