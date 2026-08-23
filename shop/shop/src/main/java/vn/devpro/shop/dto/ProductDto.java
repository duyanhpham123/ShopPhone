package vn.devpro.shop.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;

/**
 * DTO trung gian cho form Product.
 * Dùng để bind dữ liệu web và validate trước khi map sang entity Product.
 */
public class ProductDto {
	/** Tên sản phẩm (bắt buộc). */
	@NotEmpty(message = "the name is required")
	private String name;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate createDate;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private LocalDate updateDate;
	
	private Boolean status = Boolean.TRUE;
	private Boolean isHot = Boolean.FALSE;
	
	private Integer categoryId;
	private Integer createById;
	private Integer updateById;
	/** Giá niêm yết, không âm. */
	@DecimalMin(value = "0.00")
	private BigDecimal price = new BigDecimal(0);
	
	/** Giá bán, không âm. */
	@DecimalMin(value = "0.00")
	private BigDecimal salePrice = new BigDecimal(0);
	
	private String shortDescription;
	private String detailDescription;
	private String seo;
	public ProductDto(@NotEmpty(message = "the name is required") String name, LocalDate createDate,
			LocalDate updateDate, Boolean status, Boolean isHot, Integer categoryId, Integer createById,
			Integer updateById, @DecimalMin("0.00") BigDecimal price, @DecimalMin("0.00") BigDecimal salePrice,
			String shortDescription, String detailDescription, String seo) {
		super();
		this.name = name;
		this.createDate = createDate;
		this.updateDate = updateDate;
		this.status = status;
		this.isHot = isHot;
		this.categoryId = categoryId;
		this.createById = createById;
		this.updateById = updateById;
		this.price = price;
		this.salePrice = salePrice;
		this.shortDescription = shortDescription;
		this.detailDescription = detailDescription;
		this.seo = seo;
	}
	public ProductDto() {
		super();
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
	public Boolean getStatus() {
		return status;
	}
	public void setStatus(Boolean status) {
		this.status = status;
	}
	public Boolean getIsHot() {
		return isHot;
	}
	public void setIsHot(Boolean isHot) {
		this.isHot = isHot;
	}
	public Integer getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(Integer categoryId) {
		this.categoryId = categoryId;
	}
	public Integer getCreateById() {
		return createById;
	}
	public void setCreateById(Integer createById) {
		this.createById = createById;
	}
	public Integer getUpdateById() {
		return updateById;
	}
	public void setUpdateById(Integer updateById) {
		this.updateById = updateById;
	}
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	public BigDecimal getSalePrice() {
		return salePrice;
	}
	public void setSalePrice(BigDecimal salePrice) {
		this.salePrice = salePrice;
	}
	public String getShortDescription() {
		return shortDescription;
	}
	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}
	public String getDetailDescription() {
		return detailDescription;
	}
	public void setDetailDescription(String detailDescription) {
		this.detailDescription = detailDescription;
	}
	public String getSeo() {
		return seo;
	}
	public void setSeo(String seo) {
		this.seo = seo;
	}
	
	
}
