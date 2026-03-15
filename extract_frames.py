import cv2
import os
import argparse

def extract_frames(video_path, output_dir, num_frames=120):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total frames in video: {total_frames}")

    # Calculate step to get exactly num_frames
    step = max(1, total_frames // num_frames)
    
    count = 0
    saved_count = 0
    
    while cap.isOpened() and saved_count < num_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        if count % step == 0:
            frame_name = f"frame_{str(saved_count + 1).zfill(4)}.webp"
            frame_path = os.path.join(output_dir, frame_name)
            
            # Save as WebP with 80% quality
            cv2.imwrite(frame_path, frame, [cv2.IMWRITE_WEBP_QUALITY, 80])
            saved_count += 1
            print(f"Saved: {frame_name}")
            
        count += 1

    cap.release()
    print(f"Extraction complete. {saved_count} frames saved to {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract frames from video as WebP.")
    parser.add_argument("--video", type=str, required=True, help="Path to the video file.")
    parser.add_argument("--output", type=str, default="frames", help="Output directory.")
    parser.add_argument("--count", type=int, default=120, help="Number of frames to extract.")

    args = parser.parse_args()
    extract_frames(args.video, args.output, args.count)
