// OCAI Questions - Bộ câu hỏi khảo sát VHDN theo mô hình Robert Quinn và Kim Cameron

export interface OCAIQuestion {
  dimensionNumber: number;
  dimensionName: string;
  dimensionNameEn: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    cultureType: string;
    cultureTypeVi: string;
    description: string;
  }[];
}

export const OCAI_QUESTIONS: OCAIQuestion[] = [
  {
    dimensionNumber: 1,
    dimensionName: 'Đặc điểm Chi phối',
    dimensionNameEn: 'Dominant Characteristics',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Tổ chức là một nơi làm việc rất nhân văn. Giống như một gia đình mở rộng. Mọi người chia sẻ nhiều điều với nhau.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Tổ chức là một môi trường làm việc rất năng động, có tinh thần khởi nghiệp và sáng tạo. Mọi người sẵn sàng chấp nhận rủi ro.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Tổ chức là một nơi làm việc định hướng kết quả. Mối quan tâm chính là hoàn thành công việc. Mọi người đều có tinh thần cạnh tranh.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Tổ chức là một nơi làm việc rất nghiêm túc. Quy trình quản lý quy định những gì mọi người làm.'
      }
    ]
  },
  {
    dimensionNumber: 2,
    dimensionName: 'Phong cách Lãnh đạo',
    dimensionNameEn: 'Organizational Leadership',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Phong cách lãnh đạo ở đây thường là sự cố vấn, tạo điều kiện và chăm sóc nhân viên.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Phong cách lãnh đạo thường là đổi mới, nhìn xa trông rộng và chấp nhận rủi ro.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Phong cách lãnh đạo là quyết đoán, cạnh tranh và định hướng thành tích.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Phong cách lãnh đạo là điều phối, giám sát, theo dõi hiệu quả và tính ổn định.'
      }
    ]
  },
  {
    dimensionNumber: 3,
    dimensionName: 'Quản lý Nhân sự',
    dimensionNameEn: 'Management of Employees',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Nhân viên được quản lý bằng sự cam kết, tin tưởng và tạo điều kiện phát triển.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Nhân viên được quản lý bằng sự độc lập, khuyến khích sáng tạo và tự do.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Nhân viên được quản lý bằng sự cứng rắn, đòi hỏi cao và tập trung vào thành tích công việc.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Nhân viên được quản lý bằng sự an toàn công việc, các quy tắc và chính sách chính thức.'
      }
    ]
  },
  {
    dimensionNumber: 4,
    dimensionName: 'Liên kết Tổ chức',
    dimensionNameEn: 'Organization Glue',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Sự gắn kết trong tổ chức đến từ sự trung thành và tin tưởng lẫn nhau. Cam kết với tổ chức rất cao.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Sự gắn kết là cam kết với sự đổi mới và thách thức. Luôn tìm kiếm điều mới.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Sự gắn kết là sự nhấn mạnh vào việc chiến thắng và đạt mục tiêu đề ra.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Sự gắn kết là sự nhấn mạnh vào các quy tắc và thủ tục chính thức. Duy trì hoạt động trơn tru.'
      }
    ]
  },
  {
    dimensionNumber: 5,
    dimensionName: 'Nhấn mạnh Chiến lược',
    dimensionNameEn: 'Strategic Emphases',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Tổ chức nhấn mạnh sự phát triển con người, sự tin tưởng cao và tinh thần đồng đội.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Tổ chức nhấn mạnh sự đổi mới, đi đầu và tạo ra những thách thức mới.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Tổ chức nhấn mạnh hành động cạnh tranh và đạt được mục tiêu thị trường.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Tổ chức nhấn mạnh tính ổn định và hiệu quả, vận hành trơn tru và ít rủi ro.'
      }
    ]
  },
  {
    dimensionNumber: 6,
    dimensionName: 'Tiêu chí Thành công',
    dimensionNameEn: 'Criteria for Success',
    options: [
      {
        key: 'A',
        cultureType: 'Clan',
        cultureTypeVi: 'Gia đình - Hợp tác',
        description: 'Thành công được định nghĩa bằng sự phát triển nguồn nhân lực và làm việc nhóm hiệu quả.'
      },
      {
        key: 'B',
        cultureType: 'Adhocracy',
        cultureTypeVi: 'Sáng tạo',
        description: 'Thành công được định nghĩa bằng việc sản xuất các sản phẩm/dịch vụ độc đáo và mới lạ.'
      },
      {
        key: 'C',
        cultureType: 'Market',
        cultureTypeVi: 'Thị trường - Cạnh tranh',
        description: 'Thành công được định nghĩa bằng thị phần và sự vượt trội trên thị trường.'
      },
      {
        key: 'D',
        cultureType: 'Hierarchy',
        cultureTypeVi: 'Thứ bậc - Kiểm soát',
        description: 'Thành công được định nghĩa bằng sự kiểm soát, hiệu quả và độ tin cậy cao.'
      }
    ]
  }
];

export const CULTURE_COLORS = {
  clan: '#22C55E',      // Green - Hợp tác
  adhocracy: '#F59E0B', // Orange - Sáng tạo
  market: '#EF4444',    // Red - Cạnh tranh
  hierarchy: '#3B82F6'  // Blue - Kiểm soát
};

export const CULTURE_LABELS = {
  clan: 'Văn hóa Hợp tác (Clan)',
  adhocracy: 'Văn hóa Sáng tạo (Adhocracy)',
  market: 'Văn hóa Cạnh tranh (Market)',
  hierarchy: 'Văn hóa Kiểm soát (Hierarchy)'
};
