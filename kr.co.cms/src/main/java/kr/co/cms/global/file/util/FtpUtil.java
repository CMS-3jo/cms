package kr.co.cms.global.file.util;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import kr.co.cms.global.file.config.FtpProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;


@Component
@RequiredArgsConstructor
@Slf4j
public class FtpUtil {
    
    private final FtpProperties ftpProperties;
    
    /**
     * FTP 파일 업로드
     */
    public boolean uploadFile(String remotePath, MultipartFile file) {
        FTPClient ftpClient = new FTPClient();
        try {
            log.info("FTP 업로드 시작 - 파일: {}, 경로: {}", file.getOriginalFilename(), remotePath);
            
            // FTP 서버 연결
            ftpClient.connect(ftpProperties.getHost(), ftpProperties.getPort());
            log.info("FTP 연결 성공: {}:{}", ftpProperties.getHost(), ftpProperties.getPort());
            
            boolean loginSuccess = ftpClient.login(ftpProperties.getUsername(), ftpProperties.getPassword());
            if (!loginSuccess) {
                log.error("FTP 로그인 실패: {}", ftpClient.getReplyString());
                return false;
            }
            log.info("FTP 로그인 성공: {}", ftpProperties.getUsername());
            
            // 중요한 설정들
            ftpClient.enterLocalPassiveMode();  // 패시브 모드
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);  // 바이너리 모드
            ftpClient.setConnectTimeout(ftpProperties.getConnectionTimeout());
            ftpClient.setSoTimeout(ftpProperties.getSocketTimeout());
            
            // 추가 설정
            ftpClient.setControlEncoding("UTF-8");  // 인코딩 설정
            ftpClient.setBufferSize(1024 * 1024);   // 버퍼 크기 1MB
            
            String fullPath = remotePath;
            log.info("업로드 전체 경로: {}", fullPath);
            
            // 현재 작업 디렉토리 확인
            String currentDir = ftpClient.printWorkingDirectory();
            log.info("현재 작업 디렉토리: {}", currentDir);
            
            // 개선된 디렉토리 생성
            if (!createDirectoriesSimple(ftpClient, fullPath)) {
                log.error("디렉토리 생성 실패");
                return false;
            }
            
            // 파일 업로드 (개선된 방식 - 상대 경로로)
            try (InputStream inputStream = file.getInputStream()) {
                log.info("파일 업로드 시도: {} (크기: {} bytes)", fullPath, file.getSize());
                
                // 상대 경로로 변환 (앞의 / 제거)
                String relativePath = fullPath.substring(1); // /uploads/... -> uploads/...
                
                boolean success = ftpClient.storeFile(relativePath, inputStream);
                
                int replyCode = ftpClient.getReplyCode();
                String replyString = ftpClient.getReplyString();
                
                log.info("FTP 응답 코드: {}, 메시지: {}", replyCode, replyString);
                
                if (success) {
                    log.info("FTP 파일 업로드 성공: {}", relativePath);
                } else {
                    log.error("FTP 파일 업로드 실패: {} - 응답: {}", relativePath, replyString);
                    
                    // 디버깅 정보 추가
                    log.error("현재 작업 디렉토리: {}", ftpClient.printWorkingDirectory());
                    log.error("파일 크기: {} bytes", file.getSize());
                    log.error("FTP 서버 시스템: {}", ftpClient.getSystemType());
                }
                return success;
            }
            
        } catch (IOException e) {
            log.error("FTP 업로드 중 IOException: {}", e.getMessage(), e);
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                    log.info("FTP 연결 해제");
                }
            } catch (IOException e) {
                log.error("FTP 연결 해제 중 오류: {}", e.getMessage());
            }
        }
    }
    
    /**
     * 간단한 디렉토리 생성 (상대 경로 방식)
     */
    private boolean createDirectoriesSimple(FTPClient ftpClient, String filePath) throws IOException {
        // 파일 경로에서 디렉토리 부분만 추출 (앞의 / 제거)
        String dirPath = filePath.substring(1, filePath.lastIndexOf('/')); // /uploads/2025/06/21/ATTACH -> uploads/2025/06/21/ATTACH
        
        log.info("디렉토리 경로 추출: {}", dirPath);
        
        String[] dirs = dirPath.split("/");
        for (String dir : dirs) {
            if (dir.isEmpty()) continue;
            
            log.info("디렉토리 확인: {}", dir);
            
            // 디렉토리가 없으면 생성, 있으면 이동
            if (!ftpClient.changeWorkingDirectory(dir)) {
                log.info("디렉토리 생성: {}", dir);
                if (!ftpClient.makeDirectory(dir)) {
                    log.error("디렉토리 생성 실패: {} - {}", dir, ftpClient.getReplyString());
                    return false;
                }
                // 생성 후 이동
                if (!ftpClient.changeWorkingDirectory(dir)) {
                    log.error("생성된 디렉토리로 이동 실패: {}", dir);
                    return false;
                }
                log.info("디렉토리 생성 및 이동 성공: {}", dir);
            } else {
                log.info("기존 디렉토리 사용: {}", dir);
            }
        }
        
        // 홈 디렉토리로 돌아가기
        ftpClient.changeWorkingDirectory("/home/cmsftp");
        return true;
    }
    
    /**
     * 파일 경로에서 부모 디렉토리 추출
     */
    private String getParentDirectory(String filePath) {
        int lastSlash = filePath.lastIndexOf('/');
        if (lastSlash > 0) {
            return filePath.substring(0, lastSlash);
        }
        return null;
    }
    
    /**
     * 파일 경로에서 파일명만 추출
     */
    private String getFileName(String filePath) {
        int lastSlash = filePath.lastIndexOf('/');
        if (lastSlash >= 0) {
            return filePath.substring(lastSlash + 1);
        }
        return filePath;
    }
    
    /**
     * FTP 파일 삭제
     */
    public boolean deleteFile(String remotePath) {
        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(ftpProperties.getHost(), ftpProperties.getPort());
            ftpClient.login(ftpProperties.getUsername(), ftpProperties.getPassword());
            ftpClient.enterLocalPassiveMode();
            
            boolean success = ftpClient.deleteFile(remotePath);
            
            if (success) {
                log.info("FTP 파일 삭제 성공: {}", remotePath);
            } else {
                log.error("FTP 파일 삭제 실패: {}", remotePath);
            }
            return success;
            
        } catch (IOException e) {
            log.error("FTP 삭제 중 오류 발생: {}", e.getMessage(), e);
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException e) {
                log.error("FTP 연결 해제 중 오류: {}", e.getMessage());
            }
        }
    }
    
    /**
     * FTP 파일 다운로드
     */
    public byte[] downloadFile(String remotePath) {
        FTPClient ftpClient = new FTPClient();
        try {
            log.info("FTP 다운로드 시작 - 경로: {}", remotePath);

            // FTP 서버 연결
            ftpClient.connect(ftpProperties.getHost(), ftpProperties.getPort());
            boolean loginSuccess = ftpClient.login(ftpProperties.getUsername(), ftpProperties.getPassword());

            if (!loginSuccess) {
                log.error("FTP 로그인 실패: {}", ftpClient.getReplyString());
                return null;
            }

            ftpClient.enterLocalPassiveMode();
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.setControlEncoding("UTF-8");

            // 상대 경로로 변환 (앞의 / 제거)
            String relativePath = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
            log.info("FTP 상대 경로: {}", relativePath);

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                InputStream inputStream = ftpClient.retrieveFileStream(relativePath);
                
                if (inputStream == null) {
                    log.error("파일을 찾을 수 없습니다: {}", relativePath);
                    log.error("FTP 응답: {}", ftpClient.getReplyString());
                    return null;
                }

                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }

                inputStream.close();
                ftpClient.completePendingCommand();

                log.info("FTP 다운로드 성공: {} bytes", baos.size());
                return baos.toByteArray();
            }

        } catch (IOException e) {
            log.error("FTP 다운로드 중 오류: {}", e.getMessage(), e);
            return null;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                    log.info("FTP 연결 해제");
                }
            } catch (IOException e) {
                log.error("FTP 연결 해제 중 오류: {}", e.getMessage());
            }
        }
    }
}