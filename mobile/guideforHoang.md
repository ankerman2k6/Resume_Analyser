1. git switch branch
    git pull

2. 'cd' đến file cần làm (mibile or frontend) và nhập `npm install`

3. mở powershell hoặc cmd của máy, search `ipconfig` để lấy địa chỉ ipv4 của wifi 
check file `.env`, xong paste ipv4 vừa lấy được vào dòng `EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_LAN_IP:8080/api`

4. 
check `docker-compose.yml` và tìm dòng:
    ports:
      - "8081:8080"
    environment:
      # Kết nối trực tiếp tới container mongodb bên trên
      - SPRING_MONGODB_URI=mongodb://mongodb:27017/cv_screening
- nếu dùng database local thì giữ nguyên như trên, còn nếu dùng database ở ngoài thì gán ip address của server nơi lưu trữ db vào chỗ mongodb

check `~\backend\src\main\resources\application.properties` sẽ có dòng 
`spring.mongodb.uri=mongodb://localhost:27017/cv_screening` 
- nếu dùng database local thì giữ nguyên như trên, còn nếu dùng database ở ngoài thì gán ip address của server nơi lưu trữ db vào chỗ mongodb.

# hai cái trên là hai cái tôi hay thay đổi vì tôi dùng db ở server ngoài chứ không dùng local, nên ông mới phải check qua tí, còn bình thường nếu nó vẫn chạy được thì không cần check bước 4
5. chạy database, có thể dùng extension trong vscode hoặc dùng mongo compass (nhớ chạy docker)

6. chạy backend, nếu không chạy được thì xem hướng dẫn ở file `HUONG_DAN_SETTINGS_CAUHINH.md` thực ra thì thường là chạy được thôi vì tôi cài sẵn cho ông rồi

7. `npx expo start -c` hoặc `npx expo start --clear`
check cái dòng `› Using development build (Press s to switch to Expo Go)`, nếu nó hiện như này thì ấn thêm `s` để server đổi sang expo go nhé, lúc đó nó sẽ hiện là `› Using Expo Go (Press s to switch to development build)`

8. nếu lỗi fetch, hãy kiểm tra port trong terminal nó chạy, nếu nó hiện 8081 `› Metro: exp://192.168.1.16:8081` thì ông vào `.env` và sửa port thành 8081 nhé!

9. k chạy được thì hỏi AI, hỏi AI khong được thì hỏi tôi hoặc bạn An nhé