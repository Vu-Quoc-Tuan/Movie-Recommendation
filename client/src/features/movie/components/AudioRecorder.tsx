import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import {Button} from "../../../components/ui/button";


interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    isProcessing?: boolean;
}

export function AudioRecorder({ onRecordingComplete, isProcessing = false }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaStream = useRef<MediaStream | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const processor = useRef<ScriptProcessorNode | null>(null);
    const audioInput = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioChunks = useRef<Float32Array[]>([]);
    const startTime = useRef<number>(0);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;

            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000, // Request 16kHz if possible
            });

            audioInput.current = audioContext.current.createMediaStreamSource(stream);

            // Create ScriptProcessor (bufferSize, inputChannels, outputChannels)
            // 4096 is a good balance between latency and performance
            processor.current = audioContext.current.createScriptProcessor(4096, 1, 1);

            audioInput.current.connect(processor.current);
            processor.current.connect(audioContext.current.destination);

            audioChunks.current = [];
            processor.current.onaudioprocess = (event) => {
                const input = event.inputBuffer.getChannelData(0);
                audioChunks.current.push(new Float32Array(input)); // ✅ copy dữ liệu
            };

            setIsRecording(true);
            startTime.current = Date.now();
            timerInterval.current = setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime.current) / 1000));
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);

        if (processor.current && audioInput.current && audioContext.current) {
            processor.current.disconnect();
            audioInput.current.disconnect();
            // Don't close context immediately if you want to reuse, but for this simple case it's fine or just leave it open
            // audioContext.current.close(); 
        }

        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
        }

        // Process audio
        const chunks = [...audioChunks.current];
        const sampleRate = audioContext.current?.sampleRate ?? 16000;
        audioChunks.current = [];

        if (!chunks.length) {
            console.error('No audio samples captured');
            return;
        }

        const wavBlob = exportWAV(chunks, sampleRate); // ✅ encode trước khi set null
        onRecordingComplete(wavBlob);

        processor.current = null;
        audioInput.current = null;
        audioContext.current = null;
    };

    const exportWAV = (chunks: Float32Array[], sampleRate: number) => {
        // Flatten chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const buffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
        }

        // Downsample to 16kHz if needed (though we requested 16kHz, context might be 44.1/48)
        // For simplicity, let's assume we send what we captured, but ideally we should resample.
        // If context was 48k, we are sending 48k. CLOVA might accept it or we might need to resample.
        // Let's do a simple decimation if sampleRate > 16000 to save bandwidth and match requirements.

        let finalBuffer = buffer;
        let finalSampleRate = sampleRate;

        if (sampleRate > 16000) {
            const ratio = sampleRate / 16000;
            const newLength = Math.floor(totalLength / ratio);
            const newBuffer = new Float32Array(newLength);
            for (let i = 0; i < newLength; i++) {
                newBuffer[i] = buffer[Math.floor(i * ratio)];
            }
            finalBuffer = newBuffer;
            finalSampleRate = 16000;
        }

        const wavBuffer = encodeWAV(finalBuffer, finalSampleRate);
        return new Blob([wavBuffer], { type: 'audio/wav' });
    };

    const encodeWAV = (samples: Float32Array, sampleRate: number) => {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeString = (view: DataView, offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
            for (let i = 0; i < input.length; i++, offset += 2) {
                const s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        floatTo16BitPCM(view, 44, samples);

        return view;
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="rounded-full w-12 h-12 transition-all duration-200 hover:scale-105"
            >
                {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : isRecording ? (
                    <Square className="h-5 w-5 fill-current" />
                ) : (
                    <Mic className="h-6 w-6" />
                )}
            </Button>
            {isRecording && (
                <span className="text-sm font-medium animate-pulse text-red-500">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
            )}
        </div>
    );
}
