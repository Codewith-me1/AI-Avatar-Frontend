import asyncio
import base64
import wave
from cartesia import AsyncCartesia

# ==============================
# CONFIG
# ==============================

CARTESIA_API_KEY = "sk_car_2gCDqexyifiPagEK6Ttm48"

VOICE_ID = "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4"

TEXT = """
Hello Manoj!
This is a standalone Cartesia API streaming test.
If you can hear this audio, your setup is working correctly.
"""

OUTPUT_FILE = "cartesia_output.wav"

SAMPLE_RATE = 16000


# ==============================
# MAIN
# ==============================

async def main():

    client = AsyncCartesia(
        api_key=CARTESIA_API_KEY
    )

    pcm_audio = bytearray()

    try:

        print("Starting TTS stream...")

        # IMPORTANT:
        # await the coroutine FIRST
        stream = await client.tts.sse(
            model_id="sonic-3.5",
            transcript=TEXT,
            voice={
                "id": VOICE_ID,
                "mode": "id"
            },
            output_format={
                "container": "raw",
                "encoding": "pcm_s16le",
                "sample_rate": SAMPLE_RATE,
            },
        )

        async for event in stream:

            # Variant 1
            if hasattr(event, "audio") and event.audio:
                audio_chunk = event.audio

                if isinstance(audio_chunk, str):
                    audio_chunk = base64.b64decode(audio_chunk)

                pcm_audio.extend(audio_chunk)

            # Variant 2
            elif hasattr(event, "data") and event.data:
                pcm_audio.extend(
                    base64.b64decode(event.data)
                )

        print("TTS stream completed")

        # Save WAV file
        with wave.open(OUTPUT_FILE, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit PCM
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(pcm_audio)

        print(f"Audio saved to: {OUTPUT_FILE}")

    except Exception as e:
        print("ERROR:", str(e))

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())