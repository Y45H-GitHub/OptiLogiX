const speakDirections = (directions: string[]) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(directions.join('. '));
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser.');
  }
};

export default speakDirections;