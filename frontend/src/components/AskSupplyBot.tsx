import { useEffect } from 'react';

const AskSupplyBot = () => {
  useEffect(() => {
    const scriptId = 'omnidimension-web-widget';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = 'https://backend.omnidim.io/web_widget.js?secret_key=1cd4b50a1df7689b9df8e50911a5b997';
      //script.src = 'https://backend.omnidim.io/web_widget.js?secret_key=cab5e5763b93ac254ea2501843b061aa';
      document.body.appendChild(script);
    }
  }, []);
//<script id="omnidimension-web-widget" async src="https://backend.omnidim.io/web_widget.js?secret_key=781478b05acf1fac063b16952d42cacf" ></script>
  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">AskSupplyBot</h1>
      <p className="text-gray-600">
        Your AI-powered supply chain assistant is ready to help. Click the floating chat button at the bottom right to begin!
      </p>
    </div>
  );
};

export default AskSupplyBot;
