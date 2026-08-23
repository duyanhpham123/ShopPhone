package vn.devpro.shop.model;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.*;

/**
 * Entity Category ánh xạ bảng `tbl_category`.
 * Hỗ trợ quan hệ cha-con tự tham chiếu và thông tin user tạo/sửa.
 */
@Entity
@Table(name = "tbl_category")
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;
	
	@Column(name = "name", nullable = false, unique = true)
	private String name;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@Column(name = "create_date")
	private LocalDate createDate;
	
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@Column(name = "update_date")
	private LocalDate updateDate;
	
	@Column(name = "description")
	private String description;
	
	@Column(name = "status")
	private Boolean status = true;
	
	// Quan hệ tự tham chiếu: nhiều category con có thể cùng một category cha
	@ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", referencedColumnName = "id") // cột khóa ngoại
    private Category parentCategory;
	
	// Quan hệ nhiều category được tạo bởi một user
	@ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "create_by", referencedColumnName = "id") // cột khóa ngoại
    private User createBy;
	
	// Quan hệ nhiều category được sửa bởi một user
	@ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "update_by", referencedColumnName = "id") // cột khóa ngoại
    private User updateBy;

	public Category() {
		super();
	}

	public Category(Integer id, String name, LocalDate createDate, LocalDate updateDate, String description,
			Boolean status, Category parentCategory, User createBy, User updateBy) {
		super();
		this.id = id;
		this.name = name;
		this.createDate = createDate;
		this.updateDate = updateDate;
		this.description = description;
		this.status = status;
		this.parentCategory = parentCategory;
		this.createBy = createBy;
		this.updateBy = updateBy;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public LocalDate getCreateDate() {
		return createDate;
	}

	public void setCreateDate(LocalDate createDate) {
		this.createDate = createDate;
	}

	public LocalDate getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(LocalDate updateDate) {
		this.updateDate = updateDate;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
	}

	public Category getParentCategory() {
		return parentCategory;
	}

	public void setParentCategory(Category parentCategory) {
		this.parentCategory = parentCategory;
	}

	public User getCreateBy() {
		return createBy;
	}

	public void setCreateBy(User createBy) {
		this.createBy = createBy;
	}

	public User getUpdateBy() {
		return updateBy;
	}

	public void setUpdateBy(User updateBy) {
		this.updateBy = updateBy;
	}
	
	
}
