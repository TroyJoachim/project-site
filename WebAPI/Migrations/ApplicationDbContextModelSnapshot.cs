﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using WebAPI.Models;

namespace WebAPI.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.3")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            modelBuilder.Entity("WebAPI.Models.BuildStep", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<int?>("ProjectId")
                        .HasColumnType("integer");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.ToTable("BuildStep");
                });

            modelBuilder.Entity("WebAPI.Models.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("ParentId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("WebAPI.Models.Comment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int?>("BuildStepId")
                        .HasColumnType("integer");

                    b.Property<int?>("CommentId")
                        .HasColumnType("integer");

                    b.Property<int?>("ProjectId")
                        .HasColumnType("integer");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("BuildStepId");

                    b.HasIndex("CommentId");

                    b.HasIndex("ProjectId");

                    b.ToTable("Comments");
                });

            modelBuilder.Entity("WebAPI.Models.File", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int?>("BuildStepId")
                        .HasColumnType("integer");

                    b.Property<string>("FileName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("ProjectId")
                        .HasColumnType("integer");

                    b.Property<int>("Size")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("BuildStepId");

                    b.HasIndex("ProjectId");

                    b.ToTable("File");
                });

            modelBuilder.Entity("WebAPI.Models.Image", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int?>("BuildStepId")
                        .HasColumnType("integer");

                    b.Property<string>("FileName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("ProjectId")
                        .HasColumnType("integer");

                    b.Property<int>("Size")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("BuildStepId");

                    b.HasIndex("ProjectId");

                    b.ToTable("Image");
                });

            modelBuilder.Entity("WebAPI.Models.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int?>("CategoryId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("EditedAt")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("UserId");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("WebAPI.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("AvatarImgKey")
                        .HasColumnType("text");

                    b.Property<string>("FirstName")
                        .HasColumnType("text");

                    b.Property<string>("IdentityId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("LastName")
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("WebAPI.Models.BuildStep", b =>
                {
                    b.HasOne("WebAPI.Models.Project", "Project")
                        .WithMany("BuildSteps")
                        .HasForeignKey("ProjectId");

                    b.Navigation("Project");
                });

            modelBuilder.Entity("WebAPI.Models.Category", b =>
                {
                    b.HasOne("WebAPI.Models.Category", "Parent")
                        .WithMany("Subcategories")
                        .HasForeignKey("ParentId");

                    b.Navigation("Parent");
                });

            modelBuilder.Entity("WebAPI.Models.Comment", b =>
                {
                    b.HasOne("WebAPI.Models.BuildStep", null)
                        .WithMany("Comments")
                        .HasForeignKey("BuildStepId");

                    b.HasOne("WebAPI.Models.Comment", null)
                        .WithMany("Comments")
                        .HasForeignKey("CommentId");

                    b.HasOne("WebAPI.Models.Project", null)
                        .WithMany("Comments")
                        .HasForeignKey("ProjectId");
                });

            modelBuilder.Entity("WebAPI.Models.File", b =>
                {
                    b.HasOne("WebAPI.Models.BuildStep", "BuildStep")
                        .WithMany("Files")
                        .HasForeignKey("BuildStepId");

                    b.HasOne("WebAPI.Models.Project", null)
                        .WithMany("Files")
                        .HasForeignKey("ProjectId");

                    b.Navigation("BuildStep");
                });

            modelBuilder.Entity("WebAPI.Models.Image", b =>
                {
                    b.HasOne("WebAPI.Models.BuildStep", "BuildStep")
                        .WithMany("Images")
                        .HasForeignKey("BuildStepId");

                    b.HasOne("WebAPI.Models.Project", null)
                        .WithMany("Images")
                        .HasForeignKey("ProjectId");

                    b.Navigation("BuildStep");
                });

            modelBuilder.Entity("WebAPI.Models.Project", b =>
                {
                    b.HasOne("WebAPI.Models.Category", "Category")
                        .WithMany("Projects")
                        .HasForeignKey("CategoryId");

                    b.HasOne("WebAPI.Models.User", "User")
                        .WithMany("Projects")
                        .HasForeignKey("UserId");

                    b.Navigation("Category");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WebAPI.Models.BuildStep", b =>
                {
                    b.Navigation("Comments");

                    b.Navigation("Files");

                    b.Navigation("Images");
                });

            modelBuilder.Entity("WebAPI.Models.Category", b =>
                {
                    b.Navigation("Projects");

                    b.Navigation("Subcategories");
                });

            modelBuilder.Entity("WebAPI.Models.Comment", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("WebAPI.Models.Project", b =>
                {
                    b.Navigation("BuildSteps");

                    b.Navigation("Comments");

                    b.Navigation("Files");

                    b.Navigation("Images");
                });

            modelBuilder.Entity("WebAPI.Models.User", b =>
                {
                    b.Navigation("Projects");
                });
#pragma warning restore 612, 618
        }
    }
}
