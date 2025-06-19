package kr.co.cms.global.config;

import java.security.Principal;
import java.util.List;

import kr.co.cms.domain.chat.service.ChatRoomService;
import kr.co.cms.global.util.JwtUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    private final ChatRoomService chatRoomService;

    WebSocketConfig(ChatRoomService chatRoomService, JwtUtil jwtUtil) {
        this.chatRoomService = chatRoomService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // 클라이언트가 구독할 주소
        config.setApplicationDestinationPrefixes("/app"); // 메시지를 보낼 prefix
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/gs-websocket") // 웹소켓 엔드포인트
                .setAllowedOriginPatterns("*")
                .withSockJS(); // SockJS fallback 지원
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String tokenHeader = accessor.getFirstNativeHeader("Authorization");
                    if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
                        String token = tokenHeader.substring(7);

                        if (jwtUtil.isValidToken(token)) {
                            String userId = jwtUtil.getUserId(token);
                            String rawRole = jwtUtil.getRole(token);

                            if (userId == null || rawRole == null) {
                                throw new IllegalArgumentException("JWT 파싱 실패 - userId 또는 role이 null");
                            }

                            String role = "ROLE_" + rawRole;

                            UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    List.of(new SimpleGrantedAuthority(role))
                                );

                            accessor.setUser(auth);
                        }
                    }
                }

                return message;
            }
        });
    }

}
