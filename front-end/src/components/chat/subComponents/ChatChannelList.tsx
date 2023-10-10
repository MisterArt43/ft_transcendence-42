'use client'

import React, { useEffect, useRef, useState } from 'react'
import ChatChannelListElement from './elements/ChatChannelListElement'
import Image from "next/image";
import { wsChatEvents, wsChatListen } from '@/components/api/WsReq';
import { Socket } from 'socket.io-client';
import { EChannelType, IChannel } from '@/shared/typesChannel';
import { channelsDTO } from '@/shared/DTO/InterfaceDTO';
import ChatNewChannelPopup from "@/components/chat/subComponents/ChatNewChannelPopup";


export default function ChatChannelList({className, socket, channels, setCurrentChannel, currentChannel, isServerList, channelsServer}
  : { className: string, 
      socket: Socket, 
      channels: IChannel[], 
      channelsServer: IChannel[],
      setCurrentChannel: Function, 
      currentChannel: number, 
      isServerList: boolean, 
    }) {

  const counterDBG = useRef<number>(0);

  const [isPopupVisible, setPopupVisible] = useState(false); 
  const addChannel = () => {
    return (
      <>
        <button onClick={() => setPopupVisible(!isPopupVisible)}>
        {/* <button onClick={() => action()}> for DBG action */}

          <Image
              src="/channel-add.svg"
              alt="ADD CHANNEL BUTTON"
              width={26}
              height={22}
              style={{ height: "auto", width: "auto"}}
              />
        </button>
    { isPopupVisible && <ChatNewChannelPopup 
                                      className={"chat_new_channel_popup"}
                                      socket={socket}
                                      channels={channels}
                                      currentChannel={currentChannel}
                                      setterCurrentChannel={setCurrentChannel}

                                      />}
      </>
    )
  }
  const paramChannel = () => {
    return (
      
      <button onClick={() => console.log('OPEN PARAM CURRENT CHANNEL POPUP')}>
          <Image
              src="/settings.svg"
              alt="OPEN PARAMS BUTTON"
              width={18}
              height={18}
              />
        </button>
    )
  }
  
  useEffect(() => {
    console.log('HEY **************************' + JSON.stringify(channelsServer))
    console.log('HEY **************************' + JSON.stringify(channels))
  }, [])

  useEffect(() => {
    console.log('chatChannelList: channels useEffect!')

  }, [channels])

  return (

    <div className={`${className}`}>
      <div className={`chat_channel_list`}>
        {/* <ChatChannelListElement channelID={1} channelName='#Channel 1' f={setChannels(channel)} /> */}
        {/* <button onClick={() => setCurrentChannel(2)}> AHHH </button> */}
        {channels && isServerList === false &&
          channels.map((channel) => (
            <ChatChannelListElement
              key={channel.channelID}
              channelID={channel.channelID}
              channelName={channel.name}
              isInvite={false} //TODO:
              isMp={false} //TODO:
              f={() => {
                setCurrentChannel(channel.channelID);
              }}
              currentChannel={currentChannel}
            />
          ))
        }
        {channelsServer && isServerList === true &&
          channelsServer
          .filter(channel => channel.type <= EChannelType.PROTECTED)//FIXME: et bah ca marche po !
          .filter(channel => channels && !channels.some(existingChannel => existingChannel.channelID === channel.channelID)) 
          .map((channel) => (
            <ChatChannelListElement
              key={channel.channelID}
              channelID={channel.channelID}
              channelName={channel.name}
              isInvite={false} //TODO:
              isMp={false} //TODO:
              f={() => {
                wsChatEvents.joinRoom(socket, channel) //FIXME: differencier de la liste des channels dispo en serveur
                setCurrentChannel(channel.channelID); //TODO: ajouter new Channel
                setPopupVisible(false);
              }}
              currentChannel={currentChannel}
            />

          ))
        }
      </div>
     {isServerList === false && 
      <div className='chat_channel_buttons'>
        {addChannel()} &nbsp; &nbsp; | &nbsp; &nbsp; {paramChannel()}
      </div>}
    </div>
  )
}
