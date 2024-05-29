import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          default: "da251d",
          dark: "96120F",
        },
      },
      spacing: {
        "564px": "564px",
        "540px": "540px",
        "440px": "440px",
        "346px": "346px",
        "314px": "314px",
        "259px": "259px",
        "243px": "243px",
        "240px": "240px",
        "230px": "230px",
        "215px": "215px",
        "205px": "205px",
        "200px": "200px",
        "195px": "195px",
        "185px": "185px",
        "183px": "183px",
        "172px": "172px",
        "168px": "168px",
        "162px": "162px",
        "160px": "160px",
        "158px": "158px",
        "153px": "153px",
        "145px": "145px",
        "144px": "144px",
        "142px": "142px",
        "140px": "140px",
        "139px": "139px",
        "130px": "130px",
        "128px": "128px",
        "125px": "125px",
        "124px": "124px",
        "122px": "122px",
        "120px": "120px",
        "110px": "110px",
        "100px": "100px",
        "90px": "90px",
        "86px": "86px",
        "84px": "84px",
        "80px": "80px",
        "78px": "78px",
        "76px": "76px",
        "74px": "74px",
        "72px": "72px",
        "70px": "70px",
        "69px": "69px",
        "65px": "65px",
        "64px": "64px",
        "63px": "63px",
        "62px": "62px",
        "60px": "60px",
        "58px": "58px",
        "56px": "56px",
        "55px": "55px",
        "52px": "52px",
        "51px": "51px",
        "50px": "50px",
        "48px": "48px",
        "45px": "45px",
        "44px": "44px",
        "40px": "40px",
        "36px": "36px",
        "35px": "35px",
        "34px": "34px",
        "32px": "32px",
        "30px": "30px",
        "29px": "29px",
        "28px": "28px",
        "26px": "26px",
        "24px": "24px",
        "20px": "20px",
        "19px": "19px",
        "18px": "18px",
        "16px": "16px",
        "15px": "15px",
        "14px": "14px",
        "13px": "13px",
        "12px": "12px",
        "10px": "10px",
        "8px": "8px",
        "6px": "6px",
        "5px": "5px",
        "4px": "4px",
        "2px": "2px",
        "1px": "1px",
      },
      borderRadius: {
        100: "100px",
        40: "40px",
        35: "35px",
        32: "32px",
        29: "29px",
        16: "16px",
        12: "12px",
        8: "8px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      const flex = {
        ".flex-center": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      };

      const utilities = {
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
      };

      addComponents(flex);
      addComponents(utilities);
    }),
  ],
};
export default config;
