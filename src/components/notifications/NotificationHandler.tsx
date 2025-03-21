'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function NotificationHandler() {
  const { data: session } = useSession();
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Connect to the SSE endpoint
    eventSourceRef.current = new EventSource('/api/notifications');

    eventSourceRef.current.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);

        if (notification.type === 'heartbeat') return;

        if (notification.type === 'match') {
          const { matchId, status, otherUser } = notification.data;
          
          if (status === 'pending') {
            toast('New Match Request', {
              description: session?.user?.role === 'coach'
                ? `${otherUser.name} would like you to be their career coach`
                : `${otherUser.name} would like to be your career coach`,
              action: {
                label: 'View',
                onClick: () => router.push(
                  session?.user?.role === 'coach'
                    ? `/coach/seekers?match=${matchId}` 
                    : `/seeker/coaches?match=${matchId}`
                )
              }
            });
          } else {
            toast('Match Update', {
              description: `Your match with ${otherUser.name} has been ${status}`,
              action: {
                label: 'View',
                onClick: () => router.push(
                  session?.user?.role === 'coach'
                    ? `/coach/seekers?match=${matchId}` 
                    : `/seeker/coaches?match=${matchId}`
                )
              }
            });
          }
        }

        if (notification.type === 'message') {
          const { conversationId, message } = notification.data;
          
          toast('New Message', {
            description: `${message.sender.name}: ${message.content}`,
            action: {
              label: 'Reply',
              onClick: () => router.push(
                session?.user?.role === 'coach'
                  ? `/coach/messages?id=${conversationId}`
                  : `/seeker/messages?id=${conversationId}`
              )
            }
          });
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE error:', error);
      eventSourceRef.current?.close();
      
      // Try to reconnect after a delay
      setTimeout(() => {
        eventSourceRef.current = new EventSource('/api/notifications');
      }, 5000);
    };

    return () => {
      eventSourceRef.current?.close();
    };
  }, [session?.user?.id, session?.user?.role]);

  return null;
} 