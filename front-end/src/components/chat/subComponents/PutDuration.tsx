import { IUser } from "@/shared/types";
import Image from "next/image";
import * as apiReq from '@/components/api/ApiReq'
import React, { useState } from "react";
import { text } from "stream/consumers";
import { inherits } from "util";

export const DurationType = {
	none: 0,
	Mute: 1,
	Ban: 2,
} as const;

interface PutDurationProps {
	user: IUser;
	channelID?: number;
	handleType: typeof DurationType[keyof typeof DurationType];
	isVisible: boolean;
	setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
	setIsDurationVisible: React.Dispatch<React.SetStateAction<boolean>>;
	setDurationType: React.Dispatch<React.SetStateAction<typeof DurationType[keyof typeof DurationType]>>;
}

const PutDuration: React.FC<PutDurationProps> = ({ user, channelID, handleType, isVisible, setDurationType, setIsDurationVisible, setRefresh}) => {
	const [duration, setDuration] = useState<number>(60);

	function changeDuration(e: React.ChangeEvent<HTMLInputElement>) {
		if (e?.target?.value?.length === 0 ?? true) return setDuration(1);
		if (!e.target.value && !e.target.value.length && !e.target.value.match(/[0-9]/g) && e.target.value !== "0") return setDuration(0);
		const value = parseInt(e.target.value);
		if (value < 0) return setDuration(0);
		setDuration(parseInt(e.target.value));
	}

	function handleDuration() {
		if (!duration || duration <= 0 || !channelID) return;
		if (handleType === DurationType.Ban) {
			apiReq.putApi.putBanUser(channelID, user.UserID, duration * 60)
				.then(() => {
					console.log('BAN SUCCESS')
					setRefresh(true);
				})
				.catch(() => {
					console.log('BAN FAILED')
				})
			}
			else if (handleType === DurationType.Mute) {
				apiReq.putApi.putMuteUser(channelID, user.UserID, duration* 60)
				.then(() => {
					console.log('MUTE SUCCESS')
					setRefresh(true);
				})
				.catch(() => {
					console.log('MUTE FAILED')
				})
		}
		setDurationType(DurationType.none);
		setIsDurationVisible(!isVisible);
	}

	return (
		<div>
			{isVisible && (
				<div className="flex flex-col justify-center items-center text-white" style={{minWidth:"fit-content"}}>
					<label htmlFor="duration">Duration (in minutes)<h6>0 for infinit</h6></label>
					<input
						type="number"
						name="duration"
						id="duration"
						placeholder="duration in minutes"
						value={duration}
						style={{backgroundColor: "#2d3748", padding: "0.5rem", borderRadius: "0.5rem", color: "#f56565", height: "1rem", textAlign: "center", outline:"inset", width:"100%"}}
						onChange={(e) => changeDuration(e)}
					/>
					{isVisible && (<button onClick={handleDuration} style={{ verticalAlign: "-webkit-baseline-middle" }}>
						<Image
							src="/confirm.svg"
							alt="validate"
							width={20}
							height={20}
							style={{ marginTop: "-8px", marginLeft: "2%", width: "inherits", position: "absolute" }}
						/>
					</button>)}
				</div>
			)}
		</div>
	);
}

export default PutDuration;