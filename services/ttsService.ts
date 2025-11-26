export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Text-to-speech not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nl-NL'; // Set to Dutch
  utterance.rate = 0.9; // Slightly slower for clarity (NT2 friendly)
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
};
