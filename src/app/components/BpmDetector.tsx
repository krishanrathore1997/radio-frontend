"use client";
 // Importing bpm-detective

const BpmDetector = async (file: File): Promise<number> => {
   
  if (typeof window === "undefined") {
    throw new Error("BpmDetector can only be used in the browser");
  }
 const bpmDetective = (await import("bpm-detective")).default;
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      try {
        // Decode the audio data from the arrayBuffer
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Use bpm-detective to detect the BPM
        const bpm = bpmDetective(audioBuffer);

        // Resolve the BPM (ensure it's a number)
        resolve(bpm);
      } catch (err) {
        reject("Error detecting BPM: " + err);
      }
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

export default BpmDetector;
