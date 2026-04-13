import random
import time

# Danh sách string có sẵn
strings = [
           "fujino",
           "miyu",
           ]

# Khởi tạo bộ đếm
counts = {s: 0 for s in strings}

# Vòng lặp random cho tới khi 1 string đạt 10 lần
while True:
    chosen = random.choice(strings)
    counts[chosen] += 1
    print(f"Random chọn: {chosen} (hiện tại: {counts[chosen]})")

    # Kiểm tra điều kiện dừng
    if counts[chosen] == 10:
        print("\nĐã có một string đạt 10 lần!")
        break

    time.sleep(0.2)

# Xuất kết quả cuối cùng
print("\nKết quả tổng:")
for s, c in counts.items():
    print(f"{s}: {c}")
