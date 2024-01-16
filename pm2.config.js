module.exports = {
  apps: [
    {
      name: "fuhuzz.rip",
      script: "node_modules/next/dist/bin/next", // Đường dẫn đến lệnh next của Next.js
      args: "start",
      exec_mode: "cluster", // Chế độ thực thi (cluster hoặc fork)
      instances: "max", // Số lượng instances, 'max' để sử dụng tất cả các CPU core
      autorestart: true, // Khởi động lại tự động khi ứng dụng gặp lỗi
      watch: false, // Theo dõi thay đổi tệp tin và tự động khởi động lại
      max_memory_restart: "1G", // Khởi động lại khi sử dụng quá nhiều bộ nhớ
      interpreter: "~/.bun/bin/bun",
      env: {
        NODE_ENV: "production", // Môi trường
        PORT: 3000, // Cổng mà ứng dụng của bạn lắng nghe
      },
    },
  ],
}
